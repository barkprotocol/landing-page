import { NextRequest, NextResponse } from 'next/server';
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from '@solana/spl-token';
import { z } from 'zod';

// Environment variables
const SOLANA_NETWORK =
  process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';
const MILTON_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_MILTON_MINT || ''
);
const TREASURY_WALLET = new PublicKey(
  process.env.TREASURY_WALLET || ''
);
const USDC_MINT = new PublicKey(
  process.env.USDC_MINT ||
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
);
const MAX_TRANSACTION_AMOUNT = 1000; // Maximum transaction amount in SOL or USDC

// Validation schema for payment input
const PaymentSchema = z.object({
  publicKey: z
    .string()
    .refine(
      (value) => {
        try {
          new PublicKey(value);
          return true;
        } catch {
          return false;
        }
      },
      {
        message: 'Invalid Solana public key',
      }
    ),
  paymentMethod: z.enum(['SOL', 'USDC']),
  amount: z.number().positive().max(MAX_TRANSACTION_AMOUNT),
});

// Handle POST requests for payment processing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { publicKey, paymentMethod, amount } = PaymentSchema.parse(body);

    // Connect to the Solana network
    const connection = new Connection(
      SOLANA_NETWORK === 'devnet'
        ? 'https://api.devnet.solana.com'
        : 'https://api.mainnet-beta.solana.com',
      'confirmed'
    );

    const buyerPublicKey = new PublicKey(publicKey);
    let transaction = new Transaction();

    // Handle payment method: SOL
    if (paymentMethod === 'SOL') {
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: buyerPublicKey,
          toPubkey: TREASURY_WALLET,
          lamports: Math.round(amount * LAMPORTS_PER_SOL),
        })
      );
    } 
    // Handle payment method: USDC
    else if (paymentMethod === 'USDC') {
      const buyerUsdcAddress = await getAssociatedTokenAddress(
        USDC_MINT,
        buyerPublicKey
      );
      const treasuryUsdcAddress = await getAssociatedTokenAddress(
        USDC_MINT,
        TREASURY_WALLET
      );

      // Check if the treasury has an associated token account for USDC
      const treasuryUsdcAccount = await connection.getAccountInfo(
        treasuryUsdcAddress
      );
      if (!treasuryUsdcAccount) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            buyerPublicKey,
            treasuryUsdcAddress,
            TREASURY_WALLET,
            USDC_MINT
          )
        );
      }

      transaction.add(
        createTransferInstruction(
          buyerUsdcAddress,
          treasuryUsdcAddress,
          buyerPublicKey,
          Math.round(amount * 1_000_000) // USDC has 6 decimal places
        )
      );
    }

    // Prepare to transfer MILTON tokens to the buyer
    const buyerMiltonAddress = await getAssociatedTokenAddress(
      MILTON_MINT,
      buyerPublicKey
    );
    const treasuryMiltonAddress = await getAssociatedTokenAddress(
      MILTON_MINT,
      TREASURY_WALLET
    );

    // Check if the buyer has an associated token account for MILTON
    const buyerMiltonAccount = await connection.getAccountInfo(
      buyerMiltonAddress
    );
    if (!buyerMiltonAccount) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          buyerPublicKey,
          buyerMiltonAddress,
          buyerPublicKey,
          MILTON_MINT
        )
      );
    }

    // Calculate MILTON tokens to transfer (replace with your own logic)
    const miltonAmount = Math.floor(amount * 1000); // Example: 1 SOL/USDC = 1000 MILTON

    transaction.add(
      createTransferInstruction(
        treasuryMiltonAddress,
        buyerMiltonAddress,
        TREASURY_WALLET,
        miltonAmount
      )
    );

    // Get a recent blockhash for transaction
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = buyerPublicKey;

    // Serialize the transaction
    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
    });
    const base64Transaction = serializedTransaction.toString('base64');

    return NextResponse.json({
      transaction: base64Transaction,
      lastValidBlockHeight,
      message: 'Transaction created successfully',
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    // Handle Solana-specific errors if needed
    return NextResponse.json(
      { error: 'Failed to process payment', details: error.message },
      { status: 500 }
    );
  }
}

// Handle GET requests (not allowed for this endpoint)
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
