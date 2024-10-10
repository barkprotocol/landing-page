import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Keypair, TransactionInstruction } from '@solana/web3.js'
import { createTransferCheckedInstruction, getAssociatedTokenAddress, getMint } from '@solana/spl-token'
import { encodeURL, findReference, validateTransfer, TransferRequestURLFields, parseURL, createQR } from '@solana/pay'
import BigNumber from 'bignumber.js'
import { Redis } from '@upstash/redis'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { createHmac } from 'crypto'
import { Logger } from '@/lib/logger'
import { CustomError, ErrorType } from '@/lib/custom-error'
import prisma from '@/lib/prisma'
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, MEMO_PROGRAM_ID, MILTON_TOKEN_ADDRESS, USDC_TOKEN_ADDRESS } from '@/lib/solana/programs'
import { getTokenAccountBalance, createAssociatedTokenAccountIfNotExist } from '@/lib/solana/milton-token-utils'

const TREASURY_WALLET_ADDRESS = new PublicKey(process.env.TREASURY_WALLET_ADDRESS!)
const TREASURY_PRIVATE_KEY = Uint8Array.from(JSON.parse(process.env.TREASURY_PRIVATE_KEY!))

const connection = new Connection(process.env.HELIUS_RPC_URL || process.env.SOLANA_RPC_URL!)
const redis = Redis.fromEnv()
const logger = new Logger('api/solana-pay')

async function verifyJWT(token: string): Promise<boolean> {
  try {
    jwt.verify(token, process.env.JWT_SECRET!)
    return true
  } catch (error) {
    return false
  }
}

async function verifySignature(request: NextRequest): Promise<boolean> {
  const signature = request.headers.get('x-signature')
  const timestamp = request.headers.get('x-timestamp')
  const body = await request.text()

  if (!signature || !timestamp) {
    return false
  }

  const hmac = createHmac('sha256', process.env.API_SECRET!)
  hmac.update(`${timestamp}.${body}`)
  const expectedSignature = hmac.digest('hex')

  return signature === expectedSignature
}

const transferRequestSchema = z.object({
  recipient: z.string(),
  amount: z.number().positive(),
  splToken: z.string().optional(),
  reference: z.string(),
  label: z.string(),
  message: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const { success } = await rateLimit(request)
    if (!success) {
      throw new CustomError(ErrorType.RateLimitExceeded, 'Rate limit exceeded')
    }

    const authToken = request.headers.get('authorization')?.split(' ')[1]
    if (!authToken || !(await verifyJWT(authToken))) {
      throw new CustomError(ErrorType.Unauthorized, 'Unauthorized')
    }

    if (!(await verifySignature(request))) {
      throw new CustomError(ErrorType.InvalidSignature, 'Invalid signature')
    }

    const body = await request.json()
    const { recipient, amount, splToken, reference, label, message } = transferRequestSchema.parse(body)

    const transferFields: TransferRequestURLFields = {
      recipient: new PublicKey(recipient),
      amount: new BigNumber(amount),
      splToken: splToken ? new PublicKey(splToken) : undefined,
      reference: new PublicKey(reference),
      label,
      message,
    }

    const url = encodeURL(transferFields)
    const qrCode = await createQR(url)

    // Store the transfer request in the database
    const dbTransferRequest = await prisma.transferRequest.create({
      data: {
        id: `request:${Date.now()}`,
        recipient,
        amount,
        splToken,
        reference,
        label,
        message,
        status: 'pending',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // Request expires in 15 minutes
      }
    })

    return NextResponse.json({ 
      url: url.toString(), 
      qrCode: qrCode.toString(), 
      requestId: dbTransferRequest.id,
      expiresAt: dbTransferRequest.expiresAt,
    })
  } catch (error) {
    logger.error('Error creating Solana Pay URL:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    if (error instanceof CustomError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { success } = await rateLimit(request)
    if (!success) {
      throw new CustomError(ErrorType.RateLimitExceeded, 'Rate limit exceeded')
    }

    const authToken = request.headers.get('authorization')?.split(' ')[1]
    if (!authToken || !(await verifyJWT(authToken))) {
      throw new CustomError(ErrorType.Unauthorized, 'Unauthorized')
    }

    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      throw new CustomError(ErrorType.MissingParameter, 'Missing reference parameter')
    }

    const referencePublicKey = new PublicKey(reference)
    const signature = await findReference(connection, referencePublicKey)
    
    const response = await validateTransfer(
      connection,
      signature.signature,
      { 
        recipient: TREASURY_WALLET_ADDRESS,
        amount: undefined,  // We'll validate the amount manually
        splToken: undefined,  // We'll check for both SOL and USDC
      }
    )

    // Parse the transaction to get more details
    const parsedTransaction = await connection.getParsedTransaction(signature.signature, 'confirmed')
    if (!parsedTransaction || !parsedTransaction.transaction || !parsedTransaction.meta) {
      throw new CustomError(ErrorType.TransactionParsingFailed, 'Failed to parse transaction')
    }

    const instructions = parsedTransaction.transaction.message.instructions
    let paymentAmount: number | undefined
    let paymentCurrency: 'SOL' | 'USDC' | undefined
    let miltonAmount: number | undefined

    for (const ix of instructions) {
      if ('parsed' in ix) {
        if (ix.program === 'system' && ix.parsed.type === 'transfer') {
          paymentAmount = ix.parsed.info.lamports / LAMPORTS_PER_SOL
          paymentCurrency = 'SOL'
        } else if (ix.program === 'spl-token' && ix.parsed.type === 'transferChecked') {
          if (ix.parsed.info.mint === USDC_TOKEN_ADDRESS.toBase58()) {
            const usdcMint = await getMint(connection, USDC_TOKEN_ADDRESS)
            paymentAmount = Number(ix.parsed.info.tokenAmount.amount) / Math.pow(10, usdcMint.decimals)
            paymentCurrency = 'USDC'
          } else if (ix.parsed.info.mint === MILTON_TOKEN_ADDRESS.toBase58()) {
            const miltonMint = await getMint(connection, MILTON_TOKEN_ADDRESS)
            miltonAmount = Number(ix.parsed.info.tokenAmount.amount) / Math.pow(10, miltonMint.decimals)
          }
        }
      }
    }

    if (!paymentAmount || !paymentCurrency || !miltonAmount) {
      throw new CustomError(ErrorType.TransactionDetailExtractionFailed, 'Failed to extract transaction details')
    }

    // Store the transaction details in the database
    const dbTransaction = await prisma.transaction.create({
      data: {
        id: `tx:${Date.now()}`,
        signature: signature.signature,
        paymentAmount,
        paymentCurrency,
        miltonAmount,
        status: 'completed'
      }
    })

    // Trigger webhook notification
    const webhookUrl = await redis.get(`webhook:${parsedTransaction.transaction.signatures[0]}`)
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbTransaction)
      }).catch(error => logger.error('Webhook notification failed:', error))
    }

    return NextResponse.json({
      status: 'confirmed',
      details: dbTransaction,
    })
  } catch (error) {
    logger.error('Error validating transfer:', error)
    if (error instanceof CustomError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { success } = await rateLimit(request)
    if (!success) {
      throw new CustomError(ErrorType.RateLimitExceeded, 'Rate limit exceeded')
    }

    const authToken = request.headers.get('authorization')?.split(' ')[1]
    if (!authToken || !(await verifyJWT(authToken))) {
      throw new CustomError(ErrorType.Unauthorized, 'Unauthorized')
    }

    const body = await request.json()
    const { requestId } = body

    const pendingRequest = await prisma.transferRequest.findUnique({ where: { id: requestId } })
    if (!pendingRequest) {
      throw new CustomError(ErrorType.TransferRequestNotFound, 'Transfer request not found or expired')
    }

    if (pendingRequest.expiresAt < new Date()) {
      throw new CustomError(ErrorType.TransferRequestExpired, 'Transfer request has expired')
    }

    const transferFields: TransferRequestURLFields = {
      recipient: new PublicKey(pendingRequest.recipient),
      amount: new BigNumber(pendingRequest.amount),
      splToken: pendingRequest.splToken ? new PublicKey(pendingRequest.splToken) : undefined,
      reference: new PublicKey(pendingRequest.reference),
      label: pendingRequest.label,
      message: pendingRequest.message,
    }

    // Create and sign the transaction
    const transaction = new Transaction()
    const treasuryKeypair = Keypair.fromSecretKey(TREASURY_PRIVATE_KEY)

    if (transferFields.splToken) {
      const mint = await getMint(connection, transferFields.splToken)
      const sourceAccount = await getAssociatedTokenAddress(transferFields.splToken, treasuryKeypair.publicKey)
      const destinationAccount = await getAssociatedTokenAddress(transferFields.splToken, transferFields.recipient)

      // Create destination account if it doesn't exist
      await createAssociatedTokenAccountIfNotExist(connection, treasuryKeypair, transferFields.splToken, transferFields.recipient)

      transaction.add(
        createTransferCheckedInstruction(
          sourceAccount,
          transferFields.splToken,
          destinationAccount,
          treasuryKeypair.publicKey,
          BigInt(transferFields.amount.toString()),
          mint.decimals,
          TOKEN_PROGRAM_ID
        )
      )
    } else {
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: treasuryKeypair.publicKey,
          toPubkey: transferFields.recipient,
          lamports: transferFields.amount.toNumber() * LAMPORTS_PER_SOL
        })
      )
    }

    // Add memo instruction
    transaction.add(
      new TransactionInstruction({
        keys: [{ pubkey: treasuryKeypair.publicKey, isSigner: true, isWritable: true }],
        data: Buffer.from(transferFields.message),
        programId: MEMO_PROGRAM_ID
      })
    )

    const latestBlockhash = await connection.getLatestBlockhash()
    transaction.recentBlockhash = latestBlockhash.blockhash
    transaction.feePayer = treasuryKeypair.publicKey

    transaction.sign(treasuryKeypair)

    // Simulate the transaction before sending
    const simulation = await connection.simulateTransaction(transaction)
    if (simulation.value.err) {
      throw new CustomError(ErrorType.TransactionSimulationFailed, `Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`)
    }

    const txId = await connection.sendRawTransaction(transaction.serialize())

    // Wait for transaction confirmation
    const confirmation = await connection.confirmTransaction(txId, 'confirmed')
    if (confirmation.value.err) {
      throw new CustomError(ErrorType.TransactionFailed, 'Transaction failed to confirm')
    }

    // Update request status in the database
    const updatedRequest = await prisma.transferRequest.update({
      where: { id: requestId },
      data: { status: 'completed', txId }
    })

    return NextResponse.json({ txId, status: 'confirmed' })
  } catch (error) {
    logger.error('Error processing transfer:', error)
    if (error instanceof CustomError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}