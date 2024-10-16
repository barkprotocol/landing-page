import { NextRequest, NextResponse } from 'next/server'
import { Connection, Keypair, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, createTransferInstruction, getMint, createBurnInstruction } from '@solana/spl-token'
import { z } from 'zod'

const SOLANA_RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'devnet' 
  ? 'https://api.devnet.solana.com' 
  : 'https://api.mainnet-beta.solana.com'
const MILTON_TOKEN_MINT = process.env.MILTON_TOKEN_MINT
const TREASURY_WALLET = process.env.TREASURY_WALLET
const AUTHORITY_PRIVATE_KEY = process.env.AUTHORITY_PRIVATE_KEY

if (!MILTON_TOKEN_MINT || !TREASURY_WALLET || !AUTHORITY_PRIVATE_KEY) {
  throw new Error('Required environment variables are not set')
}

const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed')
const authorityKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(AUTHORITY_PRIVATE_KEY)))

const TransferSchema = z.object({
  recipientAddress: z.string(),
  amount: z.number().positive(),
})

const MintSchema = z.object({
  recipientAddress: z.string(),
  amount: z.number().positive(),
})

const BurnSchema = z.object({
  ownerAddress: z.string(),
  amount: z.number().positive(),
})

export async function POST(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.endsWith('/transfer')) {
    return handleTransfer(request)
  } else if (pathname.endsWith('/mint')) {
    return handleMint(request)
  } else if (pathname.endsWith('/burn')) {
    return handleBurn(request)
  } else {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 })
  }
}

async function handleTransfer(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipientAddress, amount } = TransferSchema.parse(body)

    const miltonTokenMint = new PublicKey(MILTON_TOKEN_MINT)
    const treasuryWallet = new PublicKey(TREASURY_WALLET)
    const recipientPublicKey = new PublicKey(recipientAddress)

    const mintInfo = await getMint(connection, miltonTokenMint)
    const transferAmount = amount * Math.pow(10, mintInfo.decimals)

    const treasuryATA = await getOrCreateAssociatedTokenAccount(
      connection,
      authorityKeypair,
      miltonTokenMint,
      treasuryWallet
    )

    const recipientATA = await getOrCreateAssociatedTokenAccount(
      connection,
      authorityKeypair,
      miltonTokenMint,
      recipientPublicKey
    )

    const transferInstruction = createTransferInstruction(
      treasuryATA.address,
      recipientATA.address,
      treasuryWallet,
      transferAmount
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
      message: `Successfully transferred ${amount} MILTON tokens to ${recipientAddress}`,
    })
  } catch (error) {
    console.error('Transfer error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

async function handleMint(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipientAddress, amount } = MintSchema.parse(body)

    const miltonTokenMint = new PublicKey(MILTON_TOKEN_MINT)
    const recipientPublicKey = new PublicKey(recipientAddress)

    const mintInfo = await getMint(connection, miltonTokenMint)
    const mintAmount = amount * Math.pow(10, mintInfo.decimals)

    const recipientATA = await getOrCreateAssociatedTokenAccount(
      connection,
      authorityKeypair,
      miltonTokenMint,
      recipientPublicKey
    )

    const mintInstruction = SystemProgram.transfer({
      fromPubkey: authorityKeypair.publicKey,
      toPubkey: recipientATA.address,
      lamports: mintAmount,
    })

    const transaction = new Transaction().add(mintInstruction)
    transaction.feePayer = authorityKeypair.publicKey
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash

    const signature = await connection.sendTransaction(transaction, [authorityKeypair])
    await connection.confirmTransaction(signature)

    return NextResponse.json({
      success: true,
      signature,
      message: `Successfully minted ${amount} MILTON tokens to ${recipientAddress}`,
    })
  } catch (error) {
    console.error('Mint error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

async function handleBurn(request: NextRequest) {
  try {
    const body = await request.json()
    const { ownerAddress, amount } = BurnSchema.parse(body)

    const miltonTokenMint = new PublicKey(MILTON_TOKEN_MINT)
    const ownerPublicKey = new PublicKey(ownerAddress)

    const mintInfo = await getMint(connection, miltonTokenMint)
    const burnAmount = amount * Math.pow(10, mintInfo.decimals)

    const ownerATA = await getOrCreateAssociatedTokenAccount(
      connection,
      authorityKeypair,
      miltonTokenMint,
      ownerPublicKey
    )

    const burnInstruction = createBurnInstruction(
      ownerATA.address,
      miltonTokenMint,
      ownerPublicKey,
      burnAmount
    )

    const transaction = new Transaction().add(burnInstruction)
    transaction.feePayer = authorityKeypair.publicKey
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash

    const signature = await connection.sendTransaction(transaction, [authorityKeypair])
    await connection.confirmTransaction(signature)

    return NextResponse.json({
      success: true,
      signature,
      message: `Successfully burned ${amount} MILTON tokens from ${ownerAddress}`,
    })
  } catch (error) {
    console.error('Burn error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Missing address parameter' }, { status: 400 })
  }

  try {
    const publicKey = new PublicKey(address)
    const miltonTokenMint = new PublicKey(MILTON_TOKEN_MINT)

    const ata = await getOrCreateAssociatedTokenAccount(
      connection,
      authorityKeypair,
      miltonTokenMint,
      publicKey
    )

    const balance = await connection.getTokenAccountBalance(ata.address)

    return NextResponse.json({
      address: publicKey.toBase58(),
      balance: balance.value.uiAmount,
    })
  } catch (error) {
    console.error('Balance retrieval error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}