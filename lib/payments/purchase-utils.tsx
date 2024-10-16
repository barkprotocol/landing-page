import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  getAccount,
} from '@solana/spl-token';
import { z } from 'zod';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '4DsZctdxSVNLGYB5YtY8A8JDg6tUoSZnQHSamXecKWWf';
const USDC_MINT_ADDRESS = process.env.NEXT_PUBLIC_USDC_MINT_ADDRESS || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';

const PurchaseSchema = z.object({
  publicKey: z.instanceof(PublicKey),
  paymentMethod: z.enum(['SOL', 'USDC']),
  paymentAmount: z.number().positive().max(1000000), // Set a reasonable maximum amount
});

/**
 * Processes a purchase transaction by transferring either SOL or USDC to a contract.
 *
 * @param publicKey - The public key of the buyer.
 * @param signTransaction - A function that signs the transaction.
 * @param paymentMethod - The payment method: either 'SOL' or 'USDC'.
 * @param paymentAmount - The amount to be paid.
 * @param setProgress - A function to update the transaction progress.
 * @returns The transaction ID if successful.
 */
export async function processPurchase(
  publicKey: PublicKey,
  signTransaction: (transaction: Transaction) => Promise<Transaction>,
  paymentMethod: 'SOL' | 'USDC',
  paymentAmount: number,
  setProgress: (progress: number) => void
): Promise<string> {
  try {
    // Validate input
    PurchaseSchema.parse({ publicKey, paymentMethod, paymentAmount });

    // Create a connection to the Solana network
    const connection = new Connection(
      SOLANA_NETWORK === 'devnet'
        ? 'https://api.devnet.solana.com'
        : 'https://api.mainnet-beta.solana.com',
      'confirmed'
    );

    // Create a new transaction
    const transaction = new Transaction();

    if (paymentMethod === 'SOL') {
      // Check SOL balance
      const balance = await connection.getBalance(publicKey);
      if (balance < paymentAmount * LAMPORTS_PER_SOL) {
        throw new Error('Insufficient SOL balance');
      }

      // SOL transfer instruction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(CONTRACT_ADDRESS),
          lamports: Math.floor(paymentAmount * LAMPORTS_PER_SOL),
        })
      );
    } else {
      // USDC transfer instruction
      const usdcMint = new PublicKey(USDC_MINT_ADDRESS);
      const fromTokenAccount = await getAssociatedTokenAddress(usdcMint, publicKey);
      const toTokenAccount = await getAssociatedTokenAddress(usdcMint, new PublicKey(CONTRACT_ADDRESS));

      // Check USDC balance
      const tokenAccount = await getAccount(connection, fromTokenAccount);
      if (BigInt(tokenAccount.amount) < BigInt(Math.floor(paymentAmount * 1000000))) {
        throw new Error('Insufficient USDC balance');
      }

      transaction.add(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          publicKey,
          Math.floor(paymentAmount * 1000000), // USDC has 6 decimals
          [],
          TOKEN_PROGRAM_ID
        )
      );
    }

    // Set a recent blockhash and fee payer
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = publicKey;

    // Sign the transaction
    const signedTransaction = await signTransaction(transaction);

    // Send and confirm the transaction
    const txid = await sendAndConfirmTransaction(
      connection,
      signedTransaction,
      [{ publicKey }],
      {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        commitment: 'confirmed',
      }
    );

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        const newProgress = Math.min(oldProgress + 10, 100);
        if (newProgress >= 100) {
          clearInterval(interval);
        }
        return newProgress;
      });
    }, 500);

    return txid;
  } catch (error) {
    console.error('Error processing purchase:', error);
    throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
  }
}