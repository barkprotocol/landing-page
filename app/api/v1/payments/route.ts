import { NextResponse } from 'next/server'
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction } from '@solana/spl-token'
import { z } from 'zod'

// Environment variables
const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'
const MILTON_MINT = new PublicKey(process.env.NEXT_PUBLIC_MILTON_MINT || '')
const TREASURY_WALLET = new PublicKey(process.env.TREASURY_WALLET || '')

// Validation schema
const PaymentSchema = z.object({
  publicKey: z.string(),
  paymentMethod: z.enum(['SOL', 'USDC']),
  amount: z.number().positive(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { publicKey, paymentMethod, amount } = PaymentSchema.parse(body)

    const connection = new Connection(
      SOLANA_NETWORK === 'devnet' 
        ? 'https://api.devnet.solana.com' 
        : 'https://api.mainnet-beta.solana.com'
    )

    const buyerPublicKey = new PublicKey(publicKey)

    let transaction = new Transaction()

    if (paymentMethod === 'SOL') {
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: buyerPublicKey,
          toPubkey: TREASURY_WALLET,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      )
    } else if (paymentMethod === 'USDC') {
      const usdcMint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') // USDC mint address
      const buyerUsdcAddress = await getAssociatedTokenAddress(usdcMint, buyerPublicKey)
      const treasuryUsdcAddress = await getAssociatedTokenAddress(usdcMint, TREASURY_WALLET)

      // Check if the treasury has an associated token account for USDC
      const treasuryUsdcAccount = await connection.getAccountInfo(treasuryUsdcAddress)
      if (!treasuryUsdcAccount) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            buyerPublicKey,
            treasuryUsdcAddress,
            TREASURY_WALLET,
            usdcMint
          )
        )
      }

      transaction.add(
        createTransferInstruction(
          buyerUsdcAddress,
          treasuryUsdcAddress,
          buyerPublicKey,
          amount * 1_000_000 // USDC has 6 decimal places
        )
      )
    }

    // Add instruction to transfer MILTON tokens to the buyer
    const buyerMiltonAddress = await getAssociatedTokenAddress(MILTON_MINT, buyerPublicKey)
    const treasuryMiltonAddress = await getAssociatedTokenAddress(MILTON_MINT, TREASURY_WALLET)

    // Check if the buyer has an associated token account for MILTON
    const buyerMiltonAccount = await connection.getAccountInfo(buyerMiltonAddress)
    if (!buyerMiltonAccount) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          buyerPublicKey,
          buyerMiltonAddress,
          buyerPublicKey,
          MILTON_MINT
        )
      )
    }

    // Calculate MILTON tokens to transfer (replace with your own logic)
    const miltonAmount = Math.floor(amount * 1000) // Example: 1 SOL/USDC = 1000 MILTON

    transaction.add(
      createTransferInstruction(
        treasuryMiltonAddress,
        buyerMiltonAddress,
        TREASURY_WALLET,
        miltonAmount
      )
    )

    // Get a recent blockhash
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = buyerPublicKey

    // Serialize the transaction
    const serializedTransaction = transaction.serialize({ requireAllSignatures: false })
    const base64Transaction = serializedTransaction.toString('base64')

    return NextResponse.json({ transaction: base64Transaction })
  } catch (error) {
    console.error('Payment processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}