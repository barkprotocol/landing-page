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
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import { CustomError, ErrorType } from './error-handling';
import { logger } from '../../solana/logger';

// Constants
const MILTON_MINT_ADDRESS = new PublicKey('YOUR_MILTON_MINT_ADDRESS_HERE'); // Replace with your actual mint address
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

    // Send transaction to create the associated token account
    await sendAndConfirmTransaction(connection, transaction, [payer], { commitment: 'confirmed' });
    logger.info(`Created MILTON token account for ${owner.toBase58()}`);
  } else {
    logger.info(`MILTON token account already exists for ${owner.toBase58()}`);
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
    // Validate the transfer amount
    if (amount <= 0) {
      throw new CustomError(ErrorType.InvalidInput, 'Transfer amount must be greater than zero');
    }

    const fromTokenAccount = await getAssociatedTokenAddress(MILTON_MINT_ADDRESS, fromAddress);
    const toTokenAccount = await getAssociatedTokenAddress(MILTON_MINT_ADDRESS, toAddress);

    // Ensure the recipient's account exists
    await createMiltonAccountIfNotExist(connection, payer, toAddress);

    // Calculate the token amount based on decimals
    const tokenAmount = BigInt(Math.round(amount * Math.pow(10, MILTON_DECIMALS)));

    // Create a transaction to transfer tokens
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

    // Send the transaction and confirm
    const signature = await sendAndConfirmTransaction(connection, transaction, [payer], { commitment: 'confirmed' });
    logger.info(`Transferred ${amount} MILTON tokens from ${fromAddress.toBase58()} to ${toAddress.toBase58()}`);
    
    return signature;
  } catch (error) {
    logger.error('Error transferring MILTON tokens:', error);
    throw new CustomError(ErrorType.TransactionFailed, 'Failed to transfer MILTON tokens: ' + error.message);
  }
}
