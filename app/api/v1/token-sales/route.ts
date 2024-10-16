import { NextRequest, NextResponse } from 'next/server'
import { Connection, Keypair, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, createTransferInstruction, getMint } from '@solana/spl-token'
import { z } from 'zod'

const SOLANA_RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'devnet' 
  ? 'https://api.devnet.solana.com' 
  : 'https://api.mainnet-beta.solana.com'
const MILTON_TOKEN_MINT = process.env.MILTON_TOKEN_MINT
const SALE_WALLET = process.env.SALE_WALLET
const AUTHORITY_PRIVATE_KEY = process.env.AUTHORITY_PRIVATE_KEY

if (!MILTON_TOKEN_MINT || !SALE_WALLET || !AUTHORITY_PRIVATE_KEY) {
  throw new Error('Required environment variables are not set')
}

const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed')
const authorityKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(AUTHORITY_PRIVATE_KEY)))

const ParticipateSchema = z.object({
  buyerAddress: z.string(),
  amount: z.number().positive(),
})

const DistributeSchema = z.object({
  recipientAddress: z.string(),
  amount: z.number().positive(),
})

// In-memory storage for sale information (replace with a database in a real-world scenario)
let saleInfo = {
  totalSupply: 200000000,
  soldAmount: 0,
  price: 0.1, // Price in SOL
  startDate: new Date('2024-11-01T00:00:00Z'),
  endDate: new Date('2024-11-31T23:59:59Z'),
}

export async function POST(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.endsWith('/participate')) {
    return handleParticipate(request)
  } else if (pathname.endsWith('/distribute')) {
    return handleDistribute(request)
  } else {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 })
  }
}

async function handleParticipate(request: NextRequest) {
  try {
    const body = await request.json()
    const { buyerAddress, amount } = ParticipateSchema.parse(body)

    if (new Date() < saleInfo.startDate || new Date() > saleInfo.endDate) {
      return NextResponse.json({ error: 'Sale is not active' }, { status: 400 })
    }

    if (saleInfo.soldAmount + amount > saleInfo.totalSupply) {
      return NextResponse.json({ error: 'Requested amount exceeds available supply' }, { status: 400 })
    }

    const buyerPublicKey = new PublicKey(buyerAddress)
    const saleWalletPublicKey = new PublicKey(SALE_WALLET)

    const solAmount = amount * saleInfo.price
    const lamports = solAmount * 1e9 // Convert SOL to lamports

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: buyerPublicKey,
        toPubkey: saleWalletPublicKey,
        lamports,
      })
    )

    transaction.feePayer = buyerPublicKey
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash

    const serializedTransaction = transaction.serialize({ requireAllSignatures: false })
    const base64Transaction = serializedTransaction.toString('base64')

    saleInfo.soldAmount += amount

    return NextResponse.json({
      success: true,
      transaction: base64Transaction,
      message: `Participation successful. Please sign and send the transaction to complete your purchase of ${amount} MILTON tokens.`,
    })
  } catch (error) {
    console.error('Participation error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

async function handleDistribute(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipientAddress, amount } = DistributeSchema.parse(body)

    const miltonTokenMint = new PublicKey(MILTON_TOKEN_MINT)
    const saleWalletPublicKey = new PublicKey(SALE_WALLET)
    const recipientPublicKey = new PublicKey(recipientAddress)

    const mintInfo = await getMint(connection, miltonTokenMint)
    const distributeAmount = amount * Math.pow(10, mintInfo.decimals)

    const saleWalletATA = await getOrCreateAssociatedTokenAccount(
      connection,
      authorityKeypair,
      miltonTokenMint,
      saleWalletPublicKey
    )

    const recipientATA = await getOrCreateAssociatedTokenAccount(
      connection,
      authorityKeypair,
      miltonTokenMint,
      recipientPublicKey
    )

    const transferInstruction = createTransferInstruction(
      saleWalletATA.address,
      recipientATA.address,
      saleWalletPublicKey,
      distributeAmount
    )

    const transaction = new Transaction().add(transferInstruction)
    transaction.feePayer = authorityKeypair.publicKey
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash

    const signature = await connection.sendTransaction(transaction, [authorityKeypair])
    await connection.confirmTransaction(signature)

    return NextResponse.json({
      success: true,
      signature,
      message: `Successfully distributed ${amount} MILTON tokens to ${recipientAddress}`,
    })
  } catch (error) {
    console.error('Distribution error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    totalSupply: saleInfo.totalSupply,
    soldAmount: saleInfo.soldAmount,
    remainingAmount: saleInfo.totalSupply - saleInfo.soldAmount,
    price: saleInfo.price,
    startDate: saleInfo.startDate.toISOString(),
    endDate: saleInfo.endDate.toISOString(),
  })
}