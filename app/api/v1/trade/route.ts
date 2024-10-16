import { NextRequest, NextResponse } from 'next/server'
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, createTransferInstruction, getMint } from '@solana/spl-token'
import { z } from 'zod'

const SOLANA_RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'devnet' 
  ? 'https://api.devnet.solana.com' 
  : 'https://api.mainnet-beta.solana.com'
const MILTON_TOKEN_MINT = process.env.MILTON_TOKEN_MINT
const AUTHORITY_PRIVATE_KEY = process.env.AUTHORITY_PRIVATE_KEY

if (!MILTON_TOKEN_MINT || !AUTHORITY_PRIVATE_KEY) {
  throw new Error('Required environment variables are not set')
}

const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed')
const authorityKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(AUTHORITY_PRIVATE_KEY)))

const CreateOrderSchema = z.object({
  traderAddress: z.string(),
  orderType: z.enum(['buy', 'sell']),
  amount: z.number().positive(),
  price: z.number().positive(),
})

const ExecuteTradeSchema = z.object({
  buyOrderId: z.string(),
  sellOrderId: z.string(),
})

// In-memory storage for orders (replace with a database in a real-world scenario)
const orders = new Map<string, {
  id: string;
  traderAddress: string;
  orderType: 'buy' | 'sell';
  amount: number;
  price: number;
  status: 'open' | 'filled' | 'cancelled';
}>()

export async function POST(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.endsWith('/create-order')) {
    return handleCreateOrder(request)
  } else if (pathname.endsWith('/execute-trade')) {
    return handleExecuteTrade(request)
  } else {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 })
  }
}

async function handleCreateOrder(request: NextRequest) {
  try {
    const body = await request.json()
    const { traderAddress, orderType, amount, price } = CreateOrderSchema.parse(body)

    const orderId = Math.random().toString(36).substring(2, 15)
    orders.set(orderId, {
      id: orderId,
      traderAddress,
      orderType,
      amount,
      price,
      status: 'open',
    })

    return NextResponse.json({
      success: true,
      orderId,
      message: `${orderType.toUpperCase()} order created successfully`,
    })
  } catch (error) {
    console.error('Create order error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

async function handleExecuteTrade(request: NextRequest) {
  try {
    const body = await request.json()
    const { buyOrderId, sellOrderId } = ExecuteTradeSchema.parse(body)

    const buyOrder = orders.get(buyOrderId)
    const sellOrder = orders.get(sellOrderId)

    if (!buyOrder || !sellOrder) {
      return NextResponse.json({ error: 'Invalid order IDs' }, { status: 400 })
    }

    if (buyOrder.status !== 'open' || sellOrder.status !== 'open') {
      return NextResponse.json({ error: 'One or both orders are not open' }, { status: 400 })
    }

    if (buyOrder.price < sellOrder.price) {
      return NextResponse.json({ error: 'Buy price is lower than sell price' }, { status: 400 })
    }

    const tradeAmount = Math.min(buyOrder.amount, sellOrder.amount)
    const tradePrice = (buyOrder.price + sellOrder.price) / 2

    const miltonTokenMint = new PublicKey(MILTON_TOKEN_MINT)
    const buyerPublicKey = new PublicKey(buyOrder.traderAddress)
    const sellerPublicKey = new PublicKey(sellOrder.traderAddress)

    const mintInfo = await getMint(connection, miltonTokenMint)
    const tokenAmount = tradeAmount * Math.pow(10, mintInfo.decimals)

    const buyerATA = await getOrCreateAssociatedTokenAccount(
      connection,
      authorityKeypair,
      miltonTokenMint,
      buyerPublicKey
    )

    const sellerATA = await getOrCreateAssociatedTokenAccount(
      connection,
      authorityKeypair,
      miltonTokenMint,
      sellerPublicKey
    )

    const transferInstruction = createTransferInstruction(
      sellerATA.address,
      buyerATA.address,
      sellerPublicKey,
      tokenAmount
    )

    const transaction = new Transaction().add(transferInstruction)
    transaction.feePayer = authorityKeypair.publicKey
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash

    const signature = await connection.sendTransaction(transaction, [authorityKeypair])
    await connection.confirmTransaction(signature)

    // Update order statuses
    buyOrder.amount -= tradeAmount
    sellOrder.amount -= tradeAmount
    
    if (buyOrder.amount === 0) buyOrder.status = 'filled'
    if (sellOrder.amount === 0) sellOrder.status = 'filled'

    orders.set(buyOrderId, buyOrder)
    orders.set(sellOrderId, sellOrder)

    return NextResponse.json({
      success: true,
      signature,
      message: `Trade executed successfully. ${tradeAmount} MILTON tokens traded at ${tradePrice} SOL each.`,
    })
  } catch (error) {
    console.error('Execute trade error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get('orderId')

  if (orderId) {
    const order = orders.get(orderId)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    return NextResponse.json(order)
  } else {
    return NextResponse.json(Array.from(orders.values()))
  }
}