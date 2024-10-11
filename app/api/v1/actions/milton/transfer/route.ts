import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferCheckedInstruction, getMint } from '@solana/spl-token'
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, MEMO_PROGRAM_ID, MILTON_MINT_ADDRESS } from '@/lib/solana/programs'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'
import { CustomError, ErrorType } from '@/lib/custom-error'
import { Logger } from '@/lib/logger'
import jwt from 'jsonwebtoken'
import { createHmac } from 'crypto'
import prisma from '@/lib/prisma'
import { getTokenAccountBalance } from '@/lib/solana/milton-token-utils'

const connection = new Connection(process.env.HELIUS_RPC_URL || process.env.SOLANA_RPC_URL!)
const logger = new Logger('api/milton/transfer')

const transferSchema = z.object({
  fromPubkey: z.string(),
  toPubkey: z.string(),
  amount: z.number().positive(),
  memo: z.string().optional(),
})

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
    const { fromPubkey, toPubkey, amount, memo } = transferSchema.parse(body)

    const from = new PublicKey(fromPubkey)
    const to = new PublicKey(toPubkey)

    let transaction = new Transaction()

    // Get the associated token accounts for sender and receiver
    const fromTokenAccount = await getAssociatedTokenAddress(MILTON_MINT_ADDRESS, from)
    const toTokenAccount = await getAssociatedTokenAddress(MILTON_MINT_ADDRESS, to)

    // Check if the sender has enough balance
    const senderBalance = await getTokenAccountBalance(connection, MILTON_MINT_ADDRESS, from)
    if (senderBalance < amount) {
      throw new CustomError(ErrorType.InsufficientFunds, 'Insufficient funds for transfer')
    }

    // Check if the receiver's associated token account exists
    const toTokenAccountInfo = await connection.getAccountInfo(toTokenAccount)

    if (!toTokenAccountInfo) {
      // If the receiver's associated token account doesn't exist, create it
      transaction.add(
        createAssociatedTokenAccountInstruction(
          from,
          toTokenAccount,
          to,
          MILTON_MINT_ADDRESS,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      )
    }

    // Get the Milton token mint info
    const miltonMint = await getMint(connection, MILTON_MINT_ADDRESS)

    // Add the transfer instruction
    transaction.add(
      createTransferCheckedInstruction(
        fromTokenAccount,
        MILTON_MINT_ADDRESS,
        toTokenAccount,
        from,
        BigInt(Math.floor(amount * Math.pow(10, miltonMint.decimals))),
        miltonMint.decimals
      )
    )

    // Add memo instruction if provided
    if (memo) {
      transaction.add(
        new SystemProgram.TransactionInstruction({
          keys: [{ pubkey: from, isSigner: true, isWritable: true }],
          data: Buffer.from(memo, 'utf-8'),
          programId: MEMO_PROGRAM_ID
        })
      )
    }

    // Get the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = from

    // Simulate the transaction
    const simulation = await connection.simulateTransaction(transaction)
    if (simulation.value.err) {
      throw new CustomError(ErrorType.TransactionSimulationFailed, `Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`)
    }

    // Serialize the transaction
    const serializedTransaction = transaction.serialize({ requireAllSignatures: false })
    const base64Transaction = serializedTransaction.toString('base64')

    // Estimate the transaction fee
    const feeEstimate = await connection.getFeeForMessage(transaction.compileMessage())

    // Store the pending transaction in the database
    const dbTransaction = await prisma.transaction.create({
      data: {
        id: `tx:${Date.now()}`,
        fromPubkey: fromPubkey,
        toPubkey: toPubkey,
        amount,
        memo,
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // Transaction expires in 15 minutes
      }
    })

    return NextResponse.json({ 
      transaction: base64Transaction,
      transactionId: dbTransaction.id,
      feeEstimate: feeEstimate.value,
      expiresAt: dbTransaction.expiresAt,
    })
  } catch (error) {
    logger.error('Error creating transaction:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
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
    const { transactionId, signedTransaction } = body

    const pendingTx = await prisma.transaction.findUnique({ where: { id: transactionId } })
    if (!pendingTx) {
      throw new CustomError(ErrorType.TransactionNotFound, 'Transaction not found or expired')
    }

    if (pendingTx.expiresAt < new Date()) {
      throw new CustomError(ErrorType.TransactionExpired, 'Transaction has expired')
    }

    const tx = Transaction.from(Buffer.from(signedTransaction, 'base64'))
    const txId = await connection.sendRawTransaction(tx.serialize())

    // Wait for transaction confirmation
    const confirmation = await connection.confirmTransaction(txId, 'confirmed')
    if (confirmation.value.err) {
      throw new CustomError(ErrorType.TransactionFailed, 'Transaction failed to confirm')
    }

    // Update transaction status in the database
    const updatedTx = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: 'completed', txId, completedAt: new Date() }
    })

    return NextResponse.json({ txId, status: 'confirmed' })
  } catch (error) {
    logger.error('Error processing transaction:', error)
    if (error instanceof CustomError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}