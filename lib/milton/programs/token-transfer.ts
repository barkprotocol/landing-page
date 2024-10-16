import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createTransferCheckedInstruction,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import { CustomError, ErrorType } from './custom-error';
import { logger } from '../solana/logger';

// Constants
const MILTON_MINT_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_MILTON_MINT_ADDRESS!);
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
    logger.info(`Created MILTON token account for ${owner.toBase58()}`);
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
    
    const signature = await sendAndConfirmTransaction(connection, transaction, [payer], { commitment: 'confirmed' });
    logger.info(`Transferred ${amount} MILTON tokens from ${fromAddress.toBase58()} to ${toAddress.toBase58()}`);
    return signature;
  } catch (error) {
    logger.error('Error transferring MILTON tokens:', error);
    throw new CustomError(ErrorType.TransactionFailed, 'Failed to transfer MILTON tokens');
  }
}

/**
 * Get the MILTON token balance for a given address
 */
export async function getMiltonBalance(
  connection: Connection,
  address: PublicKey
): Promise<number> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(MILTON_MINT_ADDRESS, address);
    const balance = await connection.getTokenAccountBalance(tokenAccount);
    const amount = parseFloat(balance.value.amount) / Math.pow(10, MILTON_DECIMALS);
    logger.info(`MILTON balance for ${address.toBase58()}: ${amount}`);
    return amount;
  } catch (error) {
    logger.error('Error getting MILTON balance:', error);
    throw new CustomError(ErrorType.BalanceCheckFailed, 'Failed to get MILTON balance');
  }
}

/**
 * Check if an address has a MILTON token account
 */
export async function hasMiltonAccount(
  connection: Connection,
  address: PublicKey
): Promise<boolean> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(MILTON_MINT_ADDRESS, address);
    const accountInfo = await connection.getAccountInfo(tokenAccount);
    const hasAccount = accountInfo !== null;
    logger.info(`Address ${address.toBase58()} ${hasAccount ? 'has' : 'does not have'} a MILTON token account`);
    return hasAccount;
  } catch (error) {
    logger.error('Error checking MILTON account:', error);
    throw new CustomError(ErrorType.AccountCheckFailed, 'Failed to check MILTON account');
  }
}

/**
 * Create a MILTON token account for a given address
 */
export async function createMiltonAccount(
  connection: Connection,
  payer: Keypair,
  owner: PublicKey
): Promise<void> {
  try {
    await createMiltonAccountIfNotExist(connection, payer, owner);
    logger.info(`Created MILTON token account for ${owner.toBase58()}`);
  } catch (error) {
    logger.error('Error creating MILTON account:', error);
    throw new CustomError(ErrorType.AccountCreationFailed, 'Failed to create MILTON account');
  }
}

export { MILTON_MINT_ADDRESS, MILTON_DECIMALS };