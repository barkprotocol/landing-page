import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey, Keypair, Transaction } from '@solana/web3.js'
import { createTransferCheckedInstruction, getAssociatedTokenAddress, getMint } from '@solana/spl-token'
import { CustomError, ErrorType } from '@/lib/custom-error'
import { rateLimit } from '@/lib/rate-limit'
import { Logger } from '@/lib/logger'
import { z } from 'zod'
import { MILTON_MINT_ADDRESS } from '@/lib/milton/programs'
import prisma from '@/lib/prisma'
import { createHmac } from 'crypto'
import jwt from 'jsonwebtoken'

const logger = new Logger('api/v1/solana-pay')

const connection = new Connection(process.env.SOLANA_RPC_URL!, 'confirmed')
const merchantWallet = new PublicKey(process.env.MERCHANT_WALLET_ADDRESS!)

const createTransactionSchema = z.object({
  amount: z.number().positive(),
  reference: z.string().optional(),
  label: z.string().optional(),
  message: z.string().optional(),
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
    const { amount, reference, label, message } = createTransactionSchema.parse(body)

    const miltonMint = await getMint(connection, MILTON_MINT_ADDRESS)
    const merchantTokenAccount = await getAssociatedTokenAddress(MILTON_MINT_ADDRESS, merchantWallet)

    const transaction = new Transaction()
    transaction.add(
      createTransferCheckedInstruction(
        merchantTokenAccount,
        MILTON_MINT_ADDRESS,
        merchantTokenAccount,
        merchantWallet,
        BigInt(amount * Math.pow(10, miltonMint.decimals)),
        miltonMint.decimals
      )
    )

    if (reference) {
      transaction.add({
        keys: [{ pubkey: new PublicKey(reference), isSigner: false, isWritable: false }],
        programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
        data: Buffer.from(reference),
      })
    }

    const serializedTransaction = transaction.serialize({ requireAllSignatures: false })
    const base64Transaction = serializedTransaction.toString('base64')

    const transactionId = `solana-pay-${Date.now()}`
    await prisma.transaction.create({
      data: {
        id: transactionId,
        amount: amount.toString(),
        currency: 'MILTON',
        status: 'pending',
        type: 'solana-pay',
        metadata: {
          reference,
          label,
          message,
        },
      },
    })

    return NextResponse.json({
      transaction: base64Transaction,
      message,
      label,
      transactionId,
    })
  } catch (error) {
    logger.error('Error creating Solana Pay transaction:', error)
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
    const { transactionId, signature } = body

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    })

    if (!transaction) {
      throw new CustomError(ErrorType.TransactionNotFound, 'Transaction not found')
    }

    const confirmationResult = await connection.confirmTransaction(signature)
    if (confirmationResult.value.err) {
      throw new CustomError(ErrorType.TransactionFailed, 'Transaction failed to confirm')
    }

    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'completed',
        signature,
      },
    })

    return NextResponse.json({ success: true, message: 'Transaction confirmed' })
  } catch (error) {
    logger.error('Error confirming Solana Pay transaction:', error)
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

    const transactionId = request.nextUrl.searchParams.get('transactionId')
    if (!transactionId) {
      throw new CustomError(ErrorType.InvalidInput, 'Transaction ID is required')
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    })

    if (!transaction) {
      throw new CustomError(ErrorType.TransactionNotFound, 'Transaction not found')
    }

    return NextResponse.json(transaction)
  } catch (error) {
    logger.error('Error fetching Solana Pay transaction:', error)
    if (error instanceof CustomError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}