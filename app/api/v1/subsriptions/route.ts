import { NextRequest, NextResponse } from 'next/server'
import { Connection, Keypair, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, createTransferInstruction, getMint } from '@solana/spl-token'
import { z } from 'zod'

const SOLANA_RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com'
const SUBSCRIPTION_TOKEN_MINT = process.env.SUBSCRIPTION_TOKEN_MINT
const SUBSCRIPTION_WALLET = process.env.SUBSCRIPTION_WALLET

if (!SUBSCRIPTION_TOKEN_MINT || !SUBSCRIPTION_WALLET) {
  throw new Error('SUBSCRIPTION_TOKEN_MINT or SUBSCRIPTION_WALLET environment variable is not set')
}

const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed')

const SubscriptionSchema = z.object({
  subscriberPublicKey: z.string(),
  planId: z.string(),
  amount: z.number().positive(),
  interval: z.enum(['monthly', 'quarterly', 'yearly']),
})

const CancelSubscriptionSchema = z.object({
  subscriberPublicKey: z.string(),
  subscriptionId: z.string(),
})

export async function POST(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.endsWith('/create')) {
    return handleCreateSubscription(request)
  } else if (pathname.endsWith('/cancel')) {
    return handleCancelSubscription(request)
  } else {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 })
  }
}

async function handleCreateSubscription(request: NextRequest) {
  try {
    const body = await request.json()
    const { subscriberPublicKey, planId, amount, interval } = SubscriptionSchema.parse(body)

    const subscriptionWalletPublicKey = new PublicKey(SUBSCRIPTION_WALLET)
    const subscriptionTokenMint = new PublicKey(SUBSCRIPTION_TOKEN_MINT)
    const subscriberPublicKeyObj = new PublicKey(subscriberPublicKey)

    // Get token mint info to determine decimals
    const mintInfo = await getMint(connection, subscriptionTokenMint)

    // Calculate the actual amount to transfer based on token decimals
    const transferAmount = amount * Math.pow(10, mintInfo.decimals)

    // Get or create associated token accounts
    const subscriberATA = await getOrCreateAssociatedTokenAccount(
      connection,
      Keypair.generate(), // Dummy keypair for ATA lookup
      subscriptionTokenMint,
      subscriberPublicKeyObj
    )

    const subscriptionWalletATA = await getOrCreateAssociatedTokenAccount(
      connection,
      Keypair.generate(), // Dummy keypair for ATA lookup
      subscriptionTokenMint,
      subscriptionWalletPublicKey
    )

    // Create transfer instruction
    const transferInstruction = createTransferInstruction(
      subscriberATA.address,
      subscriptionWalletATA.address,
      subscriberPublicKeyObj,
      transferAmount
    )

    // Create transaction
    const transaction = new Transaction().add(transferInstruction)
    transaction.feePayer = subscriberPublicKeyObj
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash

    // Serialize the transaction
    const serializedTransaction = transaction.serialize({ requireAllSignatures: false })
    const base64Transaction = serializedTransaction.toString('base64')

    // In a real-world scenario, you would store the subscription details in a database
    const subscriptionId = Math.random().toString(36).substring(2, 15)

    return NextResponse.json({
      subscriptionId,
      transaction: base64Transaction,
      message: 'Subscription created successfully. Please sign and send the transaction to complete the subscription.',
    })
  } catch (error) {
    console.error('Subscription creation error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

async function handleCancelSubscription(request: NextRequest) {
  try {
    const body = await request.json()
    const { subscriberPublicKey, subscriptionId } = CancelSubscriptionSchema.parse(body)

    // In a real-world scenario, you would update the subscription status in your database
    // For this example, we'll just return a success message

    return NextResponse.json({
      message: `Subscription ${subscriptionId} for ${subscriberPublicKey} has been cancelled successfully.`,
    })
  } catch (error) {
    console.error('Subscription cancellation error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const subscriberAddress = request.nextUrl.searchParams.get('subscriberAddress')

  if (!subscriberAddress) {
    return NextResponse.json({ error: 'Missing subscriber address' }, { status: 400 })
  }

  try {
    const subscriberPublicKey = new PublicKey(subscriberAddress)
    const subscriptionTokenMint = new PublicKey(SUBSCRIPTION_TOKEN_MINT)

    const subscriberATA = await getOrCreateAssociatedTokenAccount(
      connection,
      Keypair.generate(), // Dummy keypair for ATA lookup
      subscriptionTokenMint,
      subscriberPublicKey
    )

    const balance = await connection.getTokenAccountBalance(subscriberATA.address)

    // In a real-world scenario, you would fetch subscription details from your database
    // For this example, we'll return some mock data
    const mockSubscriptions = [
      { id: 'sub_1', planId: 'plan_basic', amount: 10, interval: 'monthly', status: 'active' },
      { id: 'sub_2', planId: 'plan_premium', amount: 25, interval: 'quarterly', status: 'active' },
    ]

    return NextResponse.json({
      subscriberAddress: subscriberPublicKey.toBase58(),
      balance: balance.value.uiAmount,
      subscriptions: mockSubscriptions,
    })
  } catch (error) {
    console.error('Subscription info retrieval error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}