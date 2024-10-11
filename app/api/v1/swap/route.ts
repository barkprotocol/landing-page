import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'
import { CustomError, ErrorType } from '@/lib/custom-error'
import { Logger } from '@/lib/logger'
import jwt from 'jsonwebtoken'
import { createHmac } from 'crypto'
import prisma from '@/lib/prisma'
import { createSwap, getUserById, updateWalletBalance } from '@/db/queries'
import { transferToken } from '@/lib/solana/solana-utils'
import { PublicKey } from '@solana/web3.js'
import { MILTON_TOKEN_ADDRESS, USDC_TOKEN_ADDRESS } from '@/lib/solana/programs'

const logger = new Logger('api/v1/milton/swap')

const swapSchema = z.object({
  fromCurrency: z.enum(['SOL', 'USDC', 'MILTON']),
  toCurrency: z.enum(['SOL', 'USDC', 'MILTON']),
  amount: z.number().positive(),
})

type JwtPayload = {
  userId: number
}

async function verifyJWT(token: string): Promise<boolean> {
  try {
    jwt.verify(token, process.env.JWT_SECRET!)
    return true
  } catch (error) {
    logger.error('JWT verification failed:', error)
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

async function getSwapRate(fromCurrency: string, toCurrency: string): Promise<number> {
  // TODO: Implement actual swap rate fetching logic
  // This could involve calling an external API or using an internal price oracle
  return 1
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const { success } = await rateLimit(request)
    if (!success) {
      throw new CustomError(ErrorType.RateLimitExceeded, 'Rate limit exceeded')
    }

    // JWT Authentication
    const authToken = request.headers.get('authorization')?.split(' ')[1]
    if (!authToken || !(await verifyJWT(authToken))) {
      throw new CustomError(ErrorType.Unauthorized, 'Unauthorized')
    }

    // Signature verification
    if (!(await verifySignature(request))) {
      throw new CustomError(ErrorType.InvalidSignature, 'Invalid signature')
    }

    // Parse and validate request body
    const body = await request.json()
    const { fromCurrency, toCurrency, amount } = swapSchema.parse(body)

    // Get user from JWT
    const decodedToken = jwt.decode(authToken) as JwtPayload
    const user = await getUserById(decodedToken.userId)
    if (!user) {
      throw new CustomError(ErrorType.UserNotFound, 'User not found')
    }

    // Check if user has sufficient balance
    const wallet = await prisma.wallets.findUnique({ where: { userId: user.id } })
    if (!wallet) {
      throw new CustomError(ErrorType.WalletNotFound, 'Wallet not found')
    }

    const fromBalance = wallet[`${fromCurrency.toLowerCase()}Balance` as keyof typeof wallet] as number
    if (fromBalance < amount) {
      throw new CustomError(ErrorType.InsufficientFunds, 'Insufficient funds')
    }

    // Calculate swap rate and amount
    const rate = await getSwapRate(fromCurrency, toCurrency)
    const toAmount = amount * rate

    // Perform the swap
    const fromMint = fromCurrency === 'MILTON' ? MILTON_TOKEN_ADDRESS : USDC_TOKEN_ADDRESS
    const toMint = toCurrency === 'MILTON' ? MILTON_TOKEN_ADDRESS : USDC_TOKEN_ADDRESS

    const signature = await transferToken(
      new PublicKey(fromMint),
      process.env.TREASURY_PRIVATE_KEY!,
      user.solanaAddress!,
      amount
    )

    // Create transaction record
    const transaction = await prisma.transactions.create({
      data: {
        userId: user.id,
        amount: amount.toString(),
        currency: fromCurrency,
        type: 'swap',
        status: 'completed',
        signature,
        fromAddress: process.env.TREASURY_WALLET_ADDRESS!,
        toAddress: user.solanaAddress!,
      },
    })

    // Create swap record
    const swap = await createSwap(
      user.id,
      fromCurrency,
      toCurrency,
      amount.toString(),
      toAmount.toString(),
      rate.toString(),
      'completed',
      transaction.id
    )

    // Update wallet balances
    await updateWalletBalance(user.id, fromCurrency, (fromBalance - amount).toString())
    await updateWalletBalance(user.id, toCurrency, (Number(wallet[`${toCurrency.toLowerCase()}Balance` as keyof typeof wallet]) + toAmount).toString())

    return NextResponse.json({ success: true, swap })
  } catch (error) {
    logger.error('Error processing swap:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    if (error instanceof CustomError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}