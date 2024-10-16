import { NextRequest, NextResponse } from 'next/server'
import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, Transaction } from '@solana/web3.js'
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
import { z } from 'zod'

const SOLANA_RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com'
const PAYER_PRIVATE_KEY = process.env.PAYER_PRIVATE_KEY

if (!PAYER_PRIVATE_KEY) {
  throw new Error('PAYER_PRIVATE_KEY environment variable is not set')
}

const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed')

const TokenGenerateSchema = z.object({
  name: z.string().min(1).max(32),
  symbol: z.string().min(1).max(10),
  decimals: z.number().int().min(0).max(9),
  initialSupply: z.number().int().min(0),
  mintAuthority: z.string().optional(),
  freezeAuthority: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, symbol, decimals, initialSupply, mintAuthority, freezeAuthority } = TokenGenerateSchema.parse(body)

    // Create a new keypair for the token mint
    const mintKeypair = Keypair.generate()

    // Use the provided payer private key
    const payerKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(PAYER_PRIVATE_KEY)))

    // Create the token mint
    const mint = await createMint(
      connection,
      payerKeypair,
      mintAuthority ? new PublicKey(mintAuthority) : payerKeypair.publicKey,
      freezeAuthority ? new PublicKey(freezeAuthority) : null,
      decimals,
      mintKeypair
    )

    // If initial supply is greater than 0, mint tokens to the payer's account
    if (initialSupply > 0) {
      const payerATA = await getOrCreateAssociatedTokenAccount(
        connection,
        payerKeypair,
        mint,
        payerKeypair.publicKey
      )

      await mintTo(
        connection,
        payerKeypair,
        mint,
        payerATA.address,
        mintAuthority ? new PublicKey(mintAuthority) : payerKeypair,
        initialSupply
      )
    }

    // Return the token information
    return NextResponse.json({
      success: true,
      tokenMint: mint.toBase58(),
      name,
      symbol,
      decimals,
      initialSupply,
      mintAuthority: mintAuthority || payerKeypair.publicKey.toBase58(),
      freezeAuthority: freezeAuthority || null,
    })
  } catch (error) {
    console.error('Token generation error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}