import { NextResponse } from 'next/server'
import { Connection, PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { z } from 'zod'

const walletSchema = z.object({
  wallet: z.string().min(32).max(44),
})

const tokenBalanceSchema = z.object({
  SOL: z.number().nonnegative(),
  USDC: z.number().nonnegative(),
  MILTON: z.number().nonnegative(),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const result = walletSchema.safeParse({ wallet: searchParams.get('wallet') })

  if (!result.success) {
    return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
  }

  const { wallet } = result.data

  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL!, 'confirmed')
    const pubkey = new PublicKey(wallet)

    // Fetch SOL balance
    const solBalance = await connection.getBalance(pubkey)

    // Fetch USDC balance
    const usdcMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
    const usdcAddress = await getAssociatedTokenAddress(usdcMint, pubkey)
    const usdcAccount = await connection.getTokenAccountBalance(usdcAddress)

    // Fetch MILTON balance
    const miltonMint = new PublicKey('4DsZctdxSVNLGYB5YtY8A8JDg6tUoSZnQHSamXecKWWf')
    const miltonAddress = await getAssociatedTokenAddress(miltonMint, pubkey)
    const miltonAccount = await connection.getTokenAccountBalance(miltonAddress)

    const balances = {
      SOL: solBalance / 1e9, // Convert lamports to SOL
      USDC: parseFloat(usdcAccount.value.amount) / 1e6, // Assuming 6 decimals for USDC
      MILTON: parseFloat(miltonAccount.value.amount) / 1e9, // Assuming 9 decimals for MILTON
    }

    const validatedBalances = tokenBalanceSchema.parse(balances)

    return NextResponse.json(validatedBalances)
  } catch (error) {
    console.error('Error fetching token balances:', error)
    return NextResponse.json({ error: 'Failed to fetch token balances' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { wallet, token, amount } = body

    const walletResult = walletSchema.safeParse({ wallet })
    if (!walletResult.success) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
    }

    if (!['SOL', 'USDC', 'MILTON'].includes(token)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // In a real application, you would update the token balance here
    // For this example, we'll just return a success message
    return NextResponse.json({ message: `Updated ${token} balance for wallet ${wallet}` }, { status: 200 })
  } catch (error) {
    console.error('Error updating token balance:', error)
    return NextResponse.json({ error: 'Failed to update token balance' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const result = walletSchema.safeParse({ wallet: searchParams.get('wallet') })

  if (!result.success) {
    return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
  }

  const { wallet } = result.data
  const token = searchParams.get('token')

  if (!['SOL', 'USDC', 'MILTON'].includes(token!)) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  try {
    // In a real application, you would remove the token balance here
    // For this example, we'll just return a success message
    return NextResponse.json({ message: `Removed ${token} balance for wallet ${wallet}` }, { status: 200 })
  } catch (error) {
    console.error('Error removing token balance:', error)
    return NextResponse.json({ error: 'Failed to remove token balance' }, { status: 500 })
  }
}