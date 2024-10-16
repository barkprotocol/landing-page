import { NextResponse } from 'next/server'
import { Connection, PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { z } from 'zod'

// Simulated data (replace with actual data fetching in a real application)
const MarketPrices = {
  SOL: 158.5,
  USDC: 1.0,
  MILTON: 0.00000010,
}

const PriceHistory = [
  { date: '2024-10-01', SOL: 15, USDC: 1, MILTON: 0.05 },
  { date: '2024-09-01', SOL: 18, USDC: 1, MILTON: 0.07 },
  { date: '2024-08-01', SOL: 20.5, USDC: 1, MILTON: 0.1 },
]

const MiltonBlinks = [
  { id: 1, content: 'About Milton Protocol!' },
  { id: 2, content: 'New DeFi protocol launches on Solana' },
]

const SocialMedia = [
  { id: 1, platform: 'X', content: 'Check out our new feature!' },
  { id: 2, platform: 'Telegram', content: 'Join our community' },
]

const walletSchema = z.object({
  wallet: z.string().min(32).max(44),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const route = searchParams.get('route')

  switch (route) {
    case 'market-prices':
      return NextResponse.json(MarketPrices)
    case 'price-history':
      return NextResponse.json(PriceHistory)
    case 'blinks':
      return NextResponse.json(MiltonBlinks)
    case 'social-media':
      return NextResponse.json(SocialMedia)
    case 'token-balances':
      return handleTokenBalances(searchParams)
    case 'transaction-history':
      return handleTransactionHistory(searchParams)
    case 'nft-gallery':
      return handleNFTGallery(searchParams)
    default:
      return NextResponse.json({ error: 'Invalid route' }, { status: 400 })
  }
}

async function handleTokenBalances(searchParams: URLSearchParams) {
  const result = walletSchema.safeParse({ wallet: searchParams.get('wallet') })

  if (!result.success) {
    return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
  }

  const { wallet } = result.data

  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL!, 'confirmed')
    const pubkey = new PublicKey(wallet)

    const solBalance = await connection.getBalance(pubkey)

    const usdcMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
    const miltonMint = new PublicKey('4DsZctdxSVNLGYB5YtY8A8JDg6tUoSZnQHSamXecKWWf')

    const [usdcAddress, miltonAddress] = await Promise.all([
      getAssociatedTokenAddress(usdcMint, pubkey),
      getAssociatedTokenAddress(miltonMint, pubkey)
    ])

    const [usdcAccount, miltonAccount] = await Promise.all([
      connection.getTokenAccountBalance(usdcAddress),
      connection.getTokenAccountBalance(miltonAddress)
    ])

    return NextResponse.json({
      SOL: solBalance / 1e9,
      USDC: parseFloat(usdcAccount.value.amount) / 1e6,
      MILTON: parseFloat(miltonAccount.value.amount) / 1e9,
    })
  } catch (error) {
    console.error('Error fetching token balances:', error)
    return NextResponse.json({ error: 'Failed to fetch token balances' }, { status: 500 })
  }
}

async function handleTransactionHistory(searchParams: URLSearchParams) {
  const result = walletSchema.safeParse({ wallet: searchParams.get('wallet') })

  if (!result.success) {
    return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
  }

  const { wallet } = result.data

  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL!, 'confirmed')
    const pubkey = new PublicKey(wallet)

    const transactions = await connection.getConfirmedSignaturesForAddress2(pubkey, { limit: 10 })

    const transactionDetails = await Promise.all(
      transactions.map(async (tx) => {
        const transaction = await connection.getConfirmedTransaction(tx.signature)
        return {
          signature: tx.signature,
          blockTime: tx.blockTime,
          // Add more transaction details as needed
        }
      })
    )

    return NextResponse.json(transactionDetails)
  } catch (error) {
    console.error('Error fetching transaction history:', error)
    return NextResponse.json({ error: 'Failed to fetch transaction history' }, { status: 500 })
  }
}

async function handleNFTGallery(searchParams: URLSearchParams) {
  const result = walletSchema.safeParse({ wallet: searchParams.get('wallet') })

  if (!result.success) {
    return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
  }

  try {
    // In a real application, you would fetch NFT data from a service like Metaplex
    // For 