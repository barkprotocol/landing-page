import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
  Signer,
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  createTransferInstruction, 
  getOrCreateAssociatedTokenAccount, 
  getMint 
} from '@solana/spl-token';

// Set up the connection to the Solana blockchain using the specified RPC URL
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

interface CreateTransactionParams {
  sender: Signer;    // The signer of the transaction (Keypair or other Signer)
  recipient: string; // The public key of the recipient
  amount: number;    // The amount to transfer (in SOL or tokens)
  token: string;     // 'SOL' for SOL transfers, or token mint address for SPL tokens
}

/**
 * Creates a transaction for transferring SOL or SPL tokens.
 * 
 * @param {CreateTransactionParams} params - Parameters for the transaction.
 * @returns {Promise<Transaction>} The created transaction.
 * @throws Will throw an error if the transaction creation fails.
 */
export async function createTransaction({ sender, recipient, amount, token }: CreateTransactionParams): Promise<Transaction> {
  // Validate the amount
  if (amount <= 0) {
    throw new Error('Amount must be greater than zero.');
  }

  const senderPublicKey = sender.publicKey; // Use the public key from the signer
  const recipientPublicKey = new PublicKey(recipient);
  
  let transaction = new Transaction();

  try {
    if (token === 'SOL') {
      // Check sender's balance for SOL transfers
      const senderBalance = await connection.getBalance(senderPublicKey);
      if (senderBalance < amount * LAMPORTS_PER_SOL) {
        throw new Error('Insufficient SOL balance.');
      }
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: senderPublicKey,
          toPubkey: recipientPublicKey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );
    } else {
      // For SPL token transfers
      const tokenPublicKey = new PublicKey(token);
      const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        sender,
        tokenPublicKey,
        senderPublicKey
      );
      const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        sender,
        tokenPublicKey,
        recipientPublicKey
      );

      // Get the token's mint information to retrieve decimals
      const mintInfo = await getMint(connection, tokenPublicKey);
      const decimals = mintInfo.decimals;

      // Create transfer instruction
      transaction.add(
        createTransferInstruction(
          senderTokenAccount.address,
          recipientTokenAccount.address,
          senderPublicKey,
          amount * Math.pow(10, decimals), // Adjusting amount based on decimals
          [],
          TOKEN_PROGRAM_ID
        )
      );
    }
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw new Error('Transaction creation failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }

  return transaction;
}

/**
 * Checks the status of a transaction based on its signature.
 * 
 * @param {string} signature - The transaction signature to check.
 * @returns {Promise<'pending' | 'confirmed' | 'failed'>} The status of the transaction.
 * @throws Will throw an error if the status check fails.
 */
export async function checkTransactionStatus(signature: string): Promise<'pending' | 'confirmed' | 'failed'> {
  try {
    const status = await connection.getSignatureStatus(signature);
    if (status.value?.confirmationStatus === 'finalized') {
      return 'confirmed';
    } else if (status.value?.confirmationStatus === 'processed') {
      return 'pending';
    } else {
      return 'failed';
    }
  } catch (error) {
    console.error('Error checking transaction status:', error);
    throw new Error('Failed to check transaction status: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}
