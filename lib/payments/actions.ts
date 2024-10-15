import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '4DsZctdxSVNLGYB5YtY8A8JDg6tUoSZnQHSamXecKWWf';
const USDC_MINT_ADDRESS = process.env.USDC_MINT_ADDRESS || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // Default USDC mint address
const SOLANA_NETWORK = process.env.SOLANA_NETWORK || 'devnet'; // Change to 'mainnet-beta' for production

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
  // Create a connection to the Solana network
  const connection = new Connection(
    SOLANA_NETWORK === 'devnet'
      ? 'https://api.devnet.solana.com'
      : 'https://api.mainnet-beta.solana.com'
  );

  // Create a new transaction
  const transaction = new Transaction();

  try {
    if (paymentMethod === 'SOL') {
      // SOL transfer instruction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(CONTRACT_ADDRESS),
          lamports: Math.floor(paymentAmount * LAMPORTS_PER_SOL), // Convert SOL to lamports
        })
      );
    } else {
      // USDC transfer instruction
      const usdcMint = new PublicKey(USDC_MINT_ADDRESS);
      const fromTokenAccount = await getAssociatedTokenAddress(usdcMint, publicKey);
      const toTokenAccount = await getAssociatedTokenAddress(usdcMint, new PublicKey(CONTRACT_ADDRESS));

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
    const { blockhash } = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = publicKey;

    // Sign the transaction
    const signedTransaction = await signTransaction(transaction);

    // Send the transaction
    const txid = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: false, // Set to false to ensure preflight checks
    });

    // Confirm the transaction
    const confirmation = await connection.confirmTransaction(txid);

    if (confirmation.value.err) {
      throw new Error('Transaction failed: ' + confirmation.value.err);
    }

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        const newProgress = oldProgress + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
        }
        return newProgress;
      });
    }, 500);

    return txid; // Return transaction ID if successful
  } catch (error) {
    console.error('Error processing purchase:', error);
    throw new Error('Purchase failed: ' + error.message);
  }
}
