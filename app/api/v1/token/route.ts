import { NextRequest, NextResponse } from 'next/server'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { createMint, getMint, mintTo, getOrCreateAssociatedTokenAccount } from '@solana/spl-token'
import { z } from 'zod'

const SOLANA_RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com'
const TOKEN_CREATOR_PRIVATE_KEY = process.env.TOKEN_CREATOR_PRIVATE_KEY

if (!TOKEN_CREATOR_PRIVATE_KEY) {
  throw new Error('TOKEN_CREATOR_PRIVATE_KEY environment variable is not set')
}

const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed')
const tokenCreatorKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(TOKEN_CREATOR_PRIVATE_KEY)))

const TokenCreateSchema = z.object({
  name: z.string().min(1).max(32),
  symbol: z.string().min(1).max(10),
  decimals: z.number().int().min(0).max(9),
  initialSupply: z.number().int().min(0).optional(),
})

const TokenMintSchema = z.object({
  mintAddress: z.string(),
  amount: z.number().int().positive(),
  recipientAddress: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.endsWith('/create')) {
    return handleTokenCreate(request)
  } else if (pathname.endsWith('/mint')) {
    return handleTokenMint(request)
  } else {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 })
  }
}

async function handleTokenCreate(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, symbol, decimals, initialSupply } = TokenCreateSchema.parse(body)

    const mint = await createMint(
      connection,
      tokenCreatorKeypair,
      tokenCreatorKeypair.publicKey,
      tokenCreatorKeypair.publicKey,
      decimals
    )

    if (initialSupply && initialSupply > 0) {
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        tokenCreatorKeypair,
        mint,
        tokenCreatorKeypair.publicKey
      )

      await mintTo(
        connection,
        tokenCreatorKeypair,
        mint,
        tokenAccount.address,
        tokenCreatorKeypair,
        initialSupply
      )
    }

    return NextResponse.json({
      success: true,
      mintAddress: mint.toBase58(),
      name,
      symbol,
      decimals,
      initialSupply: initialSupply || 0,
    })
  } catch (error) {
    console.error('Token creation error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

async function handleTokenMint(request: NextRequest) {
  try {
    const body = await request.json()
    const { mintAddress, amount, recipientAddress } = TokenMintSchema.parse(body)

    const mintPublicKey = new PublicKey(mintAddress)
    const recipientPublicKey = recipientAddress ? new PublicKey(recipientAddress) : tokenCreatorKeypair.publicKey

    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      tokenCreatorKeypair,
      mintPublicKey,
      recipientPublicKey
    )

    await mintTo(
      connection,
      tokenCreatorKeypair,
      mintPublicKey,
      tokenAccount.address,
      tokenCreatorKeypair,
      amount
    )

    return NextResponse.json({
      success: true,
      mintAddress,
      amount,
      recipientAddress: recipientPublicKey.toBase58(),
    })
  } catch (error) {
    console.error('Token minting error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const mintAddress = request.nextUrl.searchParams.get('mintAddress')

  if (!mintAddress) {
    return NextResponse.json({ error: 'Missing mint address' }, { status: 400 })
  }

  try {
    const mintPublicKey = new PublicKey(mintAddress)
    const tokenInfo = await getMint(connection, mintPublicKey)

    return NextResponse.json({
      mintAddress: mintAddress,
      supply: tokenInfo.supply.toString(),
      decimals: tokenInfo.decimals,
      isInitialized: tokenInfo.isInitialized,
      freezeAuthority: tokenInfo.freezeAuthority?.toBase58() || null,
      mintAuthority: tokenInfo.mintAuthority?.toBase58() || null,
    })
  } catch (error) {
    console.error('Token info retrieval error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}