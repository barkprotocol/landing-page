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

// Input validation schema
const walletSchema = z.object({
  wallet: z.string().min(32).max(44),  // Ensuring valid wallet address length
})

// Main API handler for different routes
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

// Handler for fetching token balances
async function handleTokenBalances(searchParams: URLSearchParams) {
  const validation = walletSchema.safeParse({ wallet: searchParams.get('wallet') })

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
  }

  const { wallet } = validation.data

  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL!, 'confirmed')
    const pubkey = new PublicKey(wallet)

    // Fetch SOL balance
    const solBalance = await connection.getBalance(pubkey)

    // Mints for USDC and Milton tokens
    const usdcMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
    const miltonMint = new PublicKey('4DsZctdxSVNLGYB5YtY8A8JDg6tUoSZnQHSamXecKWWf')

    // Fetch associated token addresses
    const [usdcAddress, miltonAddress] = await Promise.all([
      getAssociatedTokenAddress(usdcMint, pubkey),
      getAssociatedTokenAddress(miltonMint, pubkey),
    ])

    // Fetch token balances
    const [usdcAccount, miltonAccount] = await Promise.all([
      connection.getTokenAccountBalance(usdcAddress),
      connection.getTokenAccountBalance(miltonAddress),
    ])

    return NextResponse.json({
      SOL: solBalance / 1e9, // Convert from lamports to SOL
      USDC: parseFloat(usdcAccount.value.amount) / 1e6, // Convert from USDC decimals
      MILTON: parseFloat(miltonAccount.value.amount) / 1e9, // Convert from Milton decimals
    })
  } catch (error) {
    console.error('Error fetching token balances:', error)
    return NextResponse.json({ error: 'Failed to fetch token balances' }, { status: 500 })
  }
}

// Handler for fetching transaction history
async function handleTransactionHistory(searchParams: URLSearchParams) {
  const validation = walletSchema.safeParse({ wallet: searchParams.get('wallet') })

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
  }

  const { wallet } = validation.data

  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL!, 'confirmed')
    const pubkey = new PublicKey(wallet)

    // Fetch recent transaction signatures
    const transactions = await connection.getConfirmedSignaturesForAddress2(pubkey, { limit: 10 })

    // Fetch transaction details for each signature
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

// Placeholder for NFT gallery fetching (expand for actual implementation)
async function handleNFTGallery(searchParams: URLSearchParams) {
  const validation = walletSchema.safeParse({ wallet: searchParams.get('wallet') })

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
  }

  try {
    // Fetch NFT data (replace with actual logic)
    // Placeholder data; in a real app, integrate Metaplex or other NFT services
    const nftGallery = [
      { id: 1, name: 'MILTON #001', imageUrl: 'https://example.com/nft1.png' },
      { id: 2, name: 'MILTON #002', imageUrl: 'https://example.com/nft2.png' },
    ]

    return NextResponse.json(nftGallery)
  } catch (error) {
    console.error('Error fetching NFT gallery:', error)
    return NextResponse.json({ error: 'Failed to fetch NFT gallery' }, { status: 500 })
  }
}
