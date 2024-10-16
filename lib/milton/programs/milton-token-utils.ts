import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferCheckedInstruction,
} from '@solana/spl-token';
import { CustomError, ErrorType } from './error-handling';
import { logger } from '../../solana/logger';

// Constants
const MILTON_MINT_ADDRESS = new PublicKey('YOUR_MILTON_MINT_ADDRESS_HERE');
const MILTON_DECIMALS = 9; // Assuming 9 decimals for MILTON token

/**
 * Create a MILTON token account if it doesn't exist
 */
async function createMiltonAccountIfNotExist(
  connection: Connection,
  payer: Keypair,
  owner: PublicKey
): Promise<void> {
  const associatedTokenAddress = await getAssociatedTokenAddress(MILTON_MINT_ADDRESS, owner);
  const accountInfo = await connection.getAccountInfo(associatedTokenAddress);
  
  if (!accountInfo) {
    const transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        payer.publicKey,
        associatedTokenAddress,
        owner,
        MILTON_MINT_ADDRESS
      )
    );
    await sendAndConfirmTransaction(connection, transaction, [payer], { commitment: 'confirmed' });
  }
}

/**
 * Transfer MILTON tokens from one account to another
 */
export async function transferMiltonTokens(
  connection: Connection,
  payer: Keypair,
  fromAddress: PublicKey,
  toAddress: PublicKey,
  amount: number
): Promise<string> {
  try {
    const fromTokenAccount = await getAssociatedTokenAddress(MILTON_MINT_ADDRESS, fromAddress);
    const toTokenAccount = await getAssociatedTokenAddress(MILTON_MINT_ADDRESS, toAddress);
    
    await createMiltonAccountIfNotExist(connection, payer, toAddress);
    
    const tokenAmount = BigInt(Math.round(amount * Math.pow(10, MILTON_DECIMALS)));
    
    const transaction = new Transaction().add(
      createTransferCheckedInstruction(
        fromTokenAccount,
        MILTON_MINT_ADDRESS,
        toTokenAccount,
        fromAddress,
        tokenAmount,
        MILTON_DECIMALS
      )
    );
    
    return await sendAndConfirmTransaction(connection, transaction, [payer], { commitment: 'confirmed' });
  } catch (error) {
    logger.error('Error transferring MILTON tokens:', error);
    throw new CustomError(ErrorType.TransactionFailed, 'Failed to transfer MILTON tokens');
  }
}