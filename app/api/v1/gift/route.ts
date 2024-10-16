import { NextRequest, NextResponse } from 'next/server'
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, createTransferInstruction } from '@solana/spl-token'
import { z } from 'zod'

const SOLANA_RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com'
const GIFT_TOKEN_MINT = process.env.GIFT_TOKEN_MINT
const GIFT_AUTHORITY_PRIVATE_KEY = process.env.GIFT_AUTHORITY_PRIVATE_KEY

if (!GIFT_TOKEN_MINT || !GIFT_AUTHORITY_PRIVATE_KEY) {
  throw new Error('GIFT_TOKEN_MINT or GIFT_AUTHORITY_PRIVATE_KEY environment variable is not set')
}

const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed')

const GiftSchema = z.object({
  recipientAddress: z.string(),
  amount: z.number().int().positive(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipientAddress, amount } = GiftSchema.parse(body)

    // Validate recipient address
    let recipientPublicKey: PublicKey
    try {
      recipientPublicKey = new PublicKey(recipientAddress)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid recipient address' }, { status: 400 })
    }

    // Create gift authority keypair
    const giftAuthorityKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(GIFT_AUTHORITY_PRIVATE_KEY)))

    // Get or create associated token accounts
    const giftTokenMint = new PublicKey(GIFT_TOKEN_MINT)
    const giftAuthorityATA = await getOrCreateAssociatedTokenAccount(
      connection,
      giftAuthorityKeypair,
      giftTokenMint,
      giftAuthorityKeypair.publicKey
    )

    const recipientATA = await getOrCreateAssociatedTokenAccount(
      connection,
      giftAuthorityKeypair,
      giftTokenMint,
      recipientPublicKey
    )

    // Create transfer instruction
    const transferInstruction = createTransferInstruction(
      giftAuthorityATA.address,
      recipientATA.address,
      giftAuthorityKeypair.publicKey,
      amount
    )

    // Create and send transaction
    const transaction = new Transaction().add(transferInstruction)
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = giftAuthorityKeypair.publicKey

    const signature = await connection.sendTransaction(transaction, [giftAuthorityKeypair])
    await connection.confirmTransaction(signature)

    return NextResponse.json({
      success: true,
      signature,
      recipientAddress: recipientPublicKey.toBase58(),
      amount,
    })
  } catch (error) {
    console.error('Gift distribution error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const recipientAddress = request.nextUrl.searchParams.get('recipientAddress')

  if (!recipientAddress) {
    return NextResponse.json({ error: 'Missing recipient address' }, { status: 400 })
  }

  try {
    const recipientPublicKey = new PublicKey(recipientAddress)
    const giftTokenMint = new PublicKey(GIFT_TOKEN_MINT)

    const recipientATA = await getOrCreateAssociatedTokenAccount(
      connection,
      Keypair.generate(), // Dummy keypair for read-only operations
      giftTokenMint,
      recipientPublicKey
    )

    const balance = await connection.getTokenAccountBalance(recipientATA.address)

    return NextResponse.json({
      recipientAddress: recipientPublicKey.toBase58(),
      balance: balance.value.uiAmount,
    })
  } catch (error) {
    console.error('Gift balance check error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}