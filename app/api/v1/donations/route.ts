import { NextRequest, NextResponse } from 'next/server'
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, createTransferInstruction, getMint } from '@solana/spl-token'
import { z } from 'zod'

const SOLANA_RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com'
const DONATION_WALLET = process.env.DONATION_WALLET
const DONATION_TOKEN_MINT = process.env.DONATION_TOKEN_MINT

if (!DONATION_WALLET || !DONATION_TOKEN_MINT) {
  throw new Error('DONATION_WALLET or DONATION_TOKEN_MINT environment variable is not set')
}

const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed')

const DonationSchema = z.object({
  amount: z.number().positive(),
  donorPublicKey: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, donorPublicKey } = DonationSchema.parse(body)

    const donationWalletPublicKey = new PublicKey(DONATION_WALLET)
    const donationTokenMint = new PublicKey(DONATION_TOKEN_MINT)
    const donorPublicKeyObj = new PublicKey(donorPublicKey)

    // Get token mint info to determine decimals
    const mintInfo = await getMint(connection, donationTokenMint)

    // Calculate the actual amount to transfer based on token decimals
    const transferAmount = amount * Math.pow(10, mintInfo.decimals)

    // Get or create associated token accounts
    const donorATA = await getOrCreateAssociatedTokenAccount(
      connection,
      Keypair.generate(), // Dummy keypair for ATA lookup
      donationTokenMint,
      donorPublicKeyObj
    )

    const donationWalletATA = await getOrCreateAssociatedTokenAccount(
      connection,
      Keypair.generate(), // Dummy keypair for ATA lookup
      donationTokenMint,
      donationWalletPublicKey
    )

    // Create transfer instruction
    const transferInstruction = createTransferInstruction(
      donorATA.address,
      donationWalletATA.address,
      donorPublicKeyObj,
      transferAmount
    )

    // Create transaction
    const transaction = new Transaction().add(transferInstruction)
    transaction.feePayer = donorPublicKeyObj
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash

    // Serialize the transaction
    const serializedTransaction = transaction.serialize({ requireAllSignatures: false })
    const base64Transaction = serializedTransaction.toString('base64')

    return NextResponse.json({
      transaction: base64Transaction,
      message: 'Transaction created successfully. Please sign and send the transaction.',
    })
  } catch (error) {
    console.error('Donation error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const donorAddress = request.nextUrl.searchParams.get('donorAddress')

  if (!donorAddress) {
    return NextResponse.json({ error: 'Missing donor address' }, { status: 400 })
  }

  try {
    const donorPublicKey = new PublicKey(donorAddress)
    const donationTokenMint = new PublicKey(DONATION_TOKEN_MINT)

    const donorATA = await getOrCreateAssociatedTokenAccount(
      connection,
      Keypair.generate(), // Dummy keypair for ATA lookup
      donationTokenMint,
      donorPublicKey
    )

    const balance = await connection.getTokenAccountBalance(donorATA.address)

    // Get total donations (this is a simplified example, in a real-world scenario you'd need to track this separately)
    const donationWalletPublicKey = new PublicKey(DONATION_WALLET)
    const donationWalletATA = await getOrCreateAssociatedTokenAccount(
      connection,
      Keypair.generate(), // Dummy keypair for ATA lookup
      donationTokenMint,
      donationWalletPublicKey
    )
    const totalDonations = await connection.getTokenAccountBalance(donationWalletATA.address)

    return NextResponse.json({
      donorAddress: donorPublicKey.toBase58(),
      balance: balance.value.uiAmount,
      totalDonations: totalDonations.value.uiAmount,
    })
  } catch (error) {
    console.error('Donation info retrieval error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}