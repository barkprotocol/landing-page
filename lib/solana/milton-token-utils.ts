import { Connection, PublicKey, Transaction, sendAndConfirmTransaction, Keypair } from '@solana/web3.js'
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction, 
  getAccount, 
  getMint, 
  createTransferCheckedInstruction,
  createBurnCheckedInstruction
} from '@solana/spl-token'
import { CustomError, ErrorType } from '@/lib/custom-error'
import { Logger } from '@/lib/logger'

const logger = new Logger('milton-token-utils')

// MILTON Token Constants
const MILTON_DECIMALS = 9
const MILTON_MINT_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_MILTON_MINT_ADDRESS!)

/**
 * Get the balance of MILTON tokens for a given wallet address
 */
export async function getMiltonBalance(
  connection: Connection,
  ownerAddress: PublicKey
): Promise<number> {
  try {
    const associatedTokenAddress = await getAssociatedTokenAddress(MILTON_MINT_ADDRESS, ownerAddress)
    const tokenAccountInfo = await getAccount(connection, associatedTokenAddress)
    
    return Number(tokenAccountInfo.amount) / Math.pow(10, MILTON_DECIMALS)
  } catch (error) {
    logger.error('Error getting MILTON token balance:', error)
    throw new CustomError(ErrorType.TokenAccountError, 'Failed to get MILTON token balance')
  }
}

/**
 * Create a MILTON associated token account if it doesn't exist
 */
export async function createMiltonAccountIfNotExist(
  connection: Connection,
  payer: Keypair,
  ownerAddress: PublicKey
): Promise<PublicKey> {
  try {
    const associatedTokenAddress = await getAssociatedTokenAddress(MILTON_MINT_ADDRESS, ownerAddress)
    
    const accountInfo = await connection.getAccountInfo(associatedTokenAddress)
    
    if (!accountInfo) {
      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          associatedTokenAddress,
          ownerAddress,
          MILTON_MINT_ADDRESS
        )
      )
      
      await sendAndConfirmTransaction(connection, transaction, [payer])
    }
    
    return associatedTokenAddress
  } catch (error) {
    logger.error('Error creating MILTON associated token account:', error)
    throw new CustomError(ErrorType.TokenAccountError, 'Failed to create MILTON associated token account')
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
    const fromTokenAccount = await getAssociatedTokenAddress(MILTON_MINT_ADDRESS, fromAddress)
    const toTokenAccount = await getAssociatedTokenAddress(MILTON_MINT_ADDRESS, toAddress)
    
    await createMiltonAccountIfNotExist(connection, payer, toAddress)
    
    const tokenAmount = BigInt(Math.round(amount * Math.pow(10, MILTON_DECIMALS)))
    
    const transaction = new Transaction().add(
      createTransferCheckedInstruction(
        fromTokenAccount,
        MILTON_MINT_ADDRESS,
        toTokenAccount,
        fromAddress,
        tokenAmount,
        MILTON_DECIMALS
      )
    )
    
    return await sendAndConfirmTransaction(connection, transaction, [payer])
  } catch (error) {
    logger.error('Error transferring MILTON tokens:', error)
    throw new CustomError(ErrorType.TransactionFailed, 'Failed to transfer MILTON tokens')
  }
}

/**
 * Check if a MILTON associated token account exists
 */
export async function doesMiltonAccountExist(
  connection: Connection,
  ownerAddress: PublicKey
): Promise<boolean> {
  try {
    const associatedTokenAddress = await getAssociatedTokenAddress(MILTON_MINT_ADDRESS, ownerAddress)
    const accountInfo = await connection.getAccountInfo(associatedTokenAddress)
    return accountInfo !== null
  } catch (error) {
    logger.error('Error checking MILTON associated token account existence:', error)
    throw new CustomError(ErrorType.TokenAccountError, 'Failed to check MILTON associated token account existence')
  }
}

/**
 * Get the total supply of MILTON tokens
 */
export async function getMiltonTotalSupply(connection: Connection): Promise<number> {
  try {
    const mintInfo = await getMint(connection, MILTON_MINT_ADDRESS)
    return Number(mintInfo.supply) / Math.pow(10, MILTON_DECIMALS)
  } catch (error) {
    logger.error('Error getting MILTON total supply:', error)
    throw new CustomError(ErrorType.BlockchainError, 'Failed to get MILTON total supply')
  }
}

/**
 * Format MILTON token amount to display with proper decimals
 */
export function formatMiltonAmount(amount: number): string {
  return amount.toFixed(MILTON_DECIMALS)
}

/**
 * Parse MILTON token amount from user input
 */
export function parseMiltonAmount(input: string): number {
  const parsed = parseFloat(input)
  if (isNaN(parsed)) {
    throw new CustomError(ErrorType.InvalidInput, 'Invalid MILTON token amount')
  }
  return parsed
}

/**
 * Get the current price of MILTON tokens in USD
 */
export async function getMiltonPrice(connection: Connection): Promise<number> {
  try {
    // This is a placeholder implementation. In a real-world scenario, you would
    // fetch the price from an oracle or a price feed.
    return 0.1; // Assuming 1 MILTON = $0.1 USD
  } catch (error) {
    logger.error('Error fetching MILTON price:', error)
    throw new CustomError(ErrorType.ExternalApiError, 'Failed to fetch MILTON price')
  }
}

/**
 * Calculate the USD value of a given amount of MILTON tokens
 */
export async function calculateMiltonUsdValue(connection: Connection, miltonAmount: number): Promise<number> {
  const price = await getMiltonPrice(connection);
  return miltonAmount * price;
}

/**
 * Get the transaction history for a MILTON token account
 */
export async function getMiltonTransactionHistory(
  connection: Connection,
  ownerAddress: PublicKey,
  limit: number = 10
): Promise<string[]> {
  try {
    const associatedTokenAddress = await getAssociatedTokenAddress(MILTON_MINT_ADDRESS, ownerAddress)
    const transactions = await connection.getSignaturesForAddress(associatedTokenAddress, { limit })
    return transactions.map(tx => tx.signature)
  } catch (error) {
    logger.error('Error fetching MILTON transaction history:', error)
    throw new CustomError(ErrorType.BlockchainError, 'Failed to fetch MILTON transaction history')
  }
}

/**
 * Burn MILTON tokens
 */
export async function burnMiltonTokens(
  connection: Connection,
  payer: Keypair,
  ownerAddress: PublicKey,
  amount: number
): Promise<string> {
  try {
    const associatedTokenAddress = await getAssociatedTokenAddress(MILTON_MINT_ADDRESS, ownerAddress)
    const tokenAmount = BigInt(Math.round(amount * Math.pow(10, MILTON_DECIMALS)))

    const transaction = new Transaction().add(
      createBurnCheckedInstruction(
        associatedTokenAddress,
        MILTON_MINT_ADDRESS,
        ownerAddress,
        tokenAmount,
        MILTON_DECIMALS
      )
    )

    return await sendAndConfirmTransaction(connection, transaction, [payer])
  } catch (error) {
    logger.error('Error burning MILTON tokens:', error)
    throw new CustomError(ErrorType.TransactionFailed, 'Failed to burn MILTON tokens')
  }
}

export default {
  MILTON_DECIMALS,
  MILTON_MINT_ADDRESS,
  getMiltonBalance,
  createMiltonAccountIfNotExist,
  transferMiltonTokens,
  doesMiltonAccountExist,
  getMiltonTotalSupply,
  formatMiltonAmount,
  parseMiltonAmount,
  getMiltonPrice,
  calculateMiltonUsdValue,
  getMiltonTransactionHistory,
  burnMiltonTokens,
}