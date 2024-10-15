import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, Token } from '@solana/spl-token';

const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

interface CreateTransactionParams {
  sender: string; // Added sender public key as parameter
  recipient: string;
  amount: number;
  token: string; // 'SOL' for SOL transfers, or token mint address for SPL tokens
}

export async function createTransaction({ sender, recipient, amount, token }: CreateTransactionParams): Promise<Transaction> {
  const senderPublicKey = new PublicKey(sender);
  const recipientPublicKey = new PublicKey(recipient);

  let transaction = new Transaction();

  try {
    if (token === 'SOL') {
      // Add a check for sender's balance if needed
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: senderPublicKey,
          toPubkey: recipientPublicKey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );
    } else {
      const tokenPublicKey = new PublicKey(token); // Use the token parameter directly
      const tokenAccount = new Token(connection, tokenPublicKey, TOKEN_PROGRAM_ID, senderPublicKey);

      const senderTokenAccount = await tokenAccount.getOrCreateAssociatedAccountInfo(senderPublicKey);
      const recipientTokenAccount = await tokenAccount.getOrCreateAssociatedAccountInfo(recipientPublicKey);

      const { decimals } = await tokenAccount.getMintInfo();
      transaction.add(
        Token.createTransferInstruction(
          TOKEN_PROGRAM_ID,
          senderTokenAccount.address,
          recipientTokenAccount.address,
          senderPublicKey,
          [],
          amount * Math.pow(10, decimals) // Adjusting amount based on decimals
        )
      );
    }
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw new Error('Transaction creation failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }

  return transaction;
}

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
