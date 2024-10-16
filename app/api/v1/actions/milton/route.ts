import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Keypair, TransactionInstruction } from '@solana/web3.js'
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferCheckedInstruction, getMint } from '@solana/spl-token'
import { Redis } from '@upstash/redis'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { createHmac } from 'crypto'
import { Logger } from '@/lib/logger'
import { CustomError, ErrorType } from '@/lib/custom-error'
import prisma from '@/lib/prisma'
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM, ASSOCIATED_TOKEN_PROGRAM_ID, MEMO_PROGRAM_ID, MILTON_MINT_ADDRESS, USDC_TOKEN_ADDRESS } from '@/lib/milton/programs'
import { getTokenAccountBalance } from '@/lib/milton/programs/milton-token-utils'
import axios from 'axios'

const TREASURY_WALLET_ADDRESS = new PublicKey(process.env.TREASURY_WALLET_ADDRESS!)
const TREASURY_PRIVATE_KEY = Uint8Array.from(JSON.parse(process.env.TREASURY_PRIVATE_KEY!))

const connection = new Connection(process.env.HELIUS_RPC_URL || process.env.SOLANA_RPC_URL!)
const redis = Redis.fromEnv()
const logger = new Logger('api/v1/milton')

const tokenInfoSchema = z.object({
  supply: z.number().positive(),
  decimals: z.number().int().positive(),
  price: z.number().positive(),
})

type TokenInfo = z.infer<typeof tokenInfoSchema>

async function getTokenInfo(tokenAddress: PublicKey): Promise<TokenInfo> {
  const cacheKey = `token_info:${tokenAddress.toBase58()}`
  const cachedInfo = await redis.get(cacheKey)

  if (cachedInfo) {
    return tokenInfoSchema.parse(JSON.parse(cachedInfo))
  }

  const tokenMint = await getMint(connection, tokenAddress)
  const price = await fetchTokenPrice(tokenAddress)
  const tokenInfo: TokenInfo = {
    supply: Number(tokenMint.supply),
    decimals: tokenMint.decimals,
    price,
  }

  await redis.set(cacheKey, JSON.stringify(tokenInfo), { ex: 60 * 5 }) // Cache for 5 minutes
  return tokenInfo
}

async function fetchTokenPrice(tokenAddress: PublicKey): Promise<number> {
  try {
    const tokenAddressString = tokenAddress.toBase58()
    let coinGeckoId: string

    if (tokenAddressString === MILTON_MINT_ADDRESS.toBase58()) {
      // For Milton token, we'll use a mock price as it's not listed on CoinGecko
      return 0.1
    } else if (tokenAddressString === USDC_TOKEN_ADDRESS.toBase58()) {
      coinGeckoId = 'usd-coin'
    } else {
      throw new Error('Unsupported token address')
    }

    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoId}&vs_currencies=usd`)
    const price = response.data[coinGeckoId].usd
    
    if (typeof price !== 'number' || isNaN(price)) {
      throw new Error('Invalid price data received from CoinGecko')
    }

    return price
  } catch (error) {
    logger.error('Error fetching token price:', error)
    throw new CustomError(ErrorType.ExternalApiError, 'Failed to fetch token price')
  }
}

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

    const [miltonInfo, usdcInfo] = await Promise.all([
      getTokenInfo(MILTON_MINT_ADDRESS),
      getTokenInfo(USDC_TOKEN_ADDRESS),
    ])

    const treasuryMiltonBalance = await getTokenAccountBalance(connection, MILTON_MINT_ADDRESS, TREASURY_WALLET_ADDRESS)
    const treasuryUsdcBalance = await getTokenAccountBalance(connection, USDC_TOKEN_ADDRESS, TREASURY_WALLET_ADDRESS)

    return NextResponse.json({
      milton: {
        supply: miltonInfo.supply / Math.pow(10, miltonInfo.decimals),
        decimals: miltonInfo.decimals,
        price: miltonInfo.price,
        treasuryBalance: treasuryMiltonBalance,
      },
      usdc: {
        supply: usdcInfo.supply / Math.pow(10, usdcInfo.decimals),
        decimals: usdcInfo.decimals,
        price: usdcInfo.price,
        treasuryBalance: treasuryUsdcBalance,
      },
    })
  } catch (error) {
    logger.error('Error fetching token information:', error)
    if (error instanceof CustomError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const purchaseSchema = z.object({
  buyerPublicKey: z.string(),
  miltonAmount: z.number().positive(),
  paymentCurrency: z.enum(['SOL', 'USDC']),
  paymentAmount: z.number().positive(),
  slippageTolerance: z.number().min(0).max(100).default(1), // Slippage tolerance in percentage
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
    const { buyerPublicKey, miltonAmount, paymentCurrency, paymentAmount, slippageTolerance } = purchaseSchema.parse(body)

    const buyer = new PublicKey(buyerPublicKey)
    const miltonMint = await getMint(connection, MILTON_MINT_ADDRESS)
    const usdcMint = await getMint(connection, USDC_TOKEN_ADDRESS)

    // Check if the payment amount is within the slippage tolerance
    const miltonInfo = await getTokenInfo(MILTON_MINT_ADDRESS)
    const expectedPaymentAmount = miltonAmount * miltonInfo.price
    const slippageAmount = expectedPaymentAmount * (slippageTolerance / 100)
    if (paymentAmount < expectedPaymentAmount - slippageAmount || paymentAmount > expectedPaymentAmount + slippageAmount) {
      throw new CustomError(ErrorType.SlippageExceeded, 'Payment amount exceeds slippage tolerance')
    }

    let transaction = new Transaction()

    // Create Milton token account for the buyer if it doesn't exist
    const buyerMiltonAccount = await getAssociatedTokenAddress(MILTON_MINT_ADDRESS, buyer)
    const buyerMiltonAccountInfo = await connection.getAccountInfo(buyerMiltonAccount)
    if (!buyerMiltonAccountInfo) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          buyer,
          buyerMiltonAccount,
          buyer,
          MILTON_MINT_ADDRESS,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      )
    }

    // Add payment instruction
    if (paymentCurrency === 'SOL') {
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: buyer,
          toPubkey: TREASURY_WALLET_ADDRESS,
          lamports: Math.floor(paymentAmount * LAMPORTS_PER_SOL)
        })
      )
    } else if (paymentCurrency === 'USDC') {
      const buyerUsdcAccount = await getAssociatedTokenAddress(USDC_TOKEN_ADDRESS, buyer)
      transaction.add(
        createTransferCheckedInstruction(
          buyerUsdcAccount,
          USDC_TOKEN_ADDRESS,
          TREASURY_WALLET_ADDRESS,
          buyer,
          BigInt(Math.floor(paymentAmount * Math.pow(10, usdcMint.decimals))),
          usdcMint.decimals,
          TOKEN_PROGRAM_ID
        )
      )
    }

    // Add Milton token transfer instruction
    const treasuryMiltonAccount = await getAssociatedTokenAddress(MILTON_MINT_ADDRESS, TREASURY_WALLET_ADDRESS)
    transaction.add(
      createTransferCheckedInstruction(
        treasuryMiltonAccount,
        MILTON_MINT_ADDRESS,
        buyerMiltonAccount,
        TREASURY_WALLET_ADDRESS,
        BigInt(Math.floor(miltonAmount * Math.pow(10, miltonMint.decimals))),
        miltonMint.decimals,
        TOKEN_PROGRAM_ID
      )
    )

    // Add memo instruction
    transaction.add(
      new TransactionInstruction({
        keys: [{ pubkey: buyer, isSigner: true, isWritable: true }],
        data: Buffer.from(`Milton Token Purchase: ${miltonAmount} MILTON`),
        programId: MEMO_PROGRAM_ID
      })
    )

    const latestBlockhash = await connection.getLatestBlockhash()
    transaction.recentBlockhash = latestBlockhash.blockhash
    transaction.feePayer = buyer

    // Simulate the transaction
    const simulation = await connection.simulateTransaction(transaction)
    if (simulation.value.err) {
      throw new CustomError(ErrorType.TransactionSimulationFailed, `Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`)
    }

    const serializedTransaction = transaction.serialize({ requireAllSignatures: false })
    const transactionBase64 = serializedTransaction.toString('base64')

    // Store the pending transaction in the database
    const dbTransaction = await prisma.transaction.create({
      data: {
        id: `tx:${Date.now()}`,
        buyerPublicKey: buyerPublicKey,
        miltonAmount,
        paymentCurrency,
        paymentAmount,
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // Transaction expires in 15 minutes
      }
    })

    // Estimate transaction fee
    const feeEstimate = await connection.getFeeForMessage(transaction.compileMessage())

    return NextResponse.json({ 
      transaction: transactionBase64, 
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

    // Trigger webhook notification
    const webhookUrl = await redis.get(`webhook:${updatedTx.buyerPublicKey}`)
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, txId, status: 'completed' })
      }).catch(error => logger.error('Webhook notification failed:', error))
    }

    return NextResponse.json({ txId, status: 'confirmed' })
  } catch  (error) {
    logger.error('Error processing transaction:', error)
    
    if (error instanceof CustomError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
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
    const { userPublicKey, webhookUrl } = body

    // Validate webhook URL
    if (!z.string().url().safeParse(webhookUrl).success) {
      throw new CustomError(ErrorType.InvalidInput, 'Invalid webhook URL')
    }

    await redis.set(`webhook:${userPublicKey}`, webhookUrl, { ex: 60 * 60 * 24 * 30 }) // Expire after 30 days

    return NextResponse.json({ success: true, message: 'Webhook URL set successfully' })
  } catch (error) {
    logger.error('Error setting webhook URL:', error)
    if (error instanceof CustomError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}