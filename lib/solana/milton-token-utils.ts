import { Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, Keypair } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount, getMint, createTransferCheckedInstruction } from '@solana/spl-token'
import { CustomError, ErrorType } from '@/lib/custom-error'
import { Logger } from '@/lib/logger'

const logger = new Logger('milton-token-utils')

// MILTON Token Constants
const MILTON_DECIMALS = 9
const MILTON_TOKEN_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_MILTON_TOKEN_ADDRESS!)

/**
 * Get the balance of MILTON tokens for a given wallet address
 * @param connection Solana connection
 * @param ownerAddress The owner's wallet address
 * @returns The MILTON token balance as a number
 */
export async function getMiltonBalance(
  connection: Connection,
  ownerAddress: PublicKey
): Promise<number> {
  try {
    const associatedTokenAddress = await getAssociatedTokenAddress(MILTON_TOKEN_ADDRESS, ownerAddress)
    const tokenAccountInfo = await getAccount(connection, associatedTokenAddress)
    
    return Number(tokenAccountInfo.amount) / Math.pow(10, MILTON_DECIMALS)
  } catch (error) {
    logger.error('Error getting MILTON token balance:', error)
    throw new CustomError(ErrorType.TokenAccountError, 'Failed to get MILTON token balance')
  }
}

/**
 * Create a MILTON associated token account if it doesn't exist
 * @param connection Solana connection
 * @param payer The account that will pay for the transaction
 * @param ownerAddress The owner's wallet address
 * @returns The associated token address
 */
export async function createMiltonAccountIfNotExist(
  connection: Connection,
  payer: Keypair,
  ownerAddress: PublicKey
): Promise<PublicKey> {
  try {
    const associatedTokenAddress = await getAssociatedTokenAddress(MILTON_TOKEN_ADDRESS, ownerAddress)
    
    // Check if the account already exists
    const accountInfo = await connection.getAccountInfo(associatedTokenAddress)
    
    if (!accountInfo) {
      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          associatedTokenAddress,
          ownerAddress,
          MILTON_TOKEN_ADDRESS
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
 * @param connection Solana connection
 * @param payer The account that will pay for the transaction
 * @param fromAddress The sender's wallet address
 * @param toAddress The recipient's wallet address
 * @param amount The amount of MILTON tokens to transfer
 * @returns The transaction signature
 */
export async function transferMiltonTokens(
  connection: Connection,
  payer: Keypair,
  fromAddress: PublicKey,
  toAddress: PublicKey,
  amount: number
): Promise<string> {
  try {
    const fromTokenAccount = await getAssociatedTokenAddress(MILTON_TOKEN_ADDRESS, fromAddress)
    const toTokenAccount = await getAssociatedTokenAddress(MILTON_TOKEN_ADDRESS, toAddress)
    
    // Create the recipient's associated token account if it doesn't exist
    await createMiltonAccountIfNotExist(connection, payer, toAddress)
    
    const tokenAmount = BigInt(Math.round(amount * Math.pow(10, MILTON_DECIMALS)))
    
    const transaction = new Transaction().add(
      createTransferCheckedInstruction(
        fromTokenAccount,
        MILTON_TOKEN_ADDRESS,
        toTokenAccount,
        fromAddress,
        tokenAmount,
        MILTON_DECIMALS
      )
    )
    
    const signature = await sendAndConfirmTransaction(connection, transaction, [payer])
    return signature
  } catch (error) {
    logger.error('Error transferring MILTON tokens:', error)
    throw new CustomError(ErrorType.TokenTransferError, 'Failed to transfer MILTON tokens')
  }
}

/**
 * Check if a MILTON associated token account exists
 * @param connection Solana connection
 * @param ownerAddress The owner's wallet address
 * @returns True if the MILTON associated token account exists, false otherwise
 */
export async function doesMiltonAccountExist(
  connection: Connection,
  ownerAddress: PublicKey
): Promise<boolean> {
  try {
    const associatedTokenAddress = await getAssociatedTokenAddress(MILTON_TOKEN_ADDRESS, ownerAddress)
    const accountInfo = await connection.getAccountInfo(associatedTokenAddress)
    return accountInfo !== null
  } catch (error) {
    logger.error('Error checking MILTON associated token account existence:', error)
    throw new CustomError(ErrorType.TokenAccountError, 'Failed to check MILTON associated token account existence')
  }
}

/**
 * Get the total supply of MILTON tokens
 * @param connection Solana connection
 * @returns The total supply of MILTON tokens
 */
export async function getMiltonTotalSupply(connection: Connection): Promise<number> {
  try {
    const mintInfo = await getMint(connection, MILTON_TOKEN_ADDRESS)
    return Number(mintInfo.supply) / Math.pow(10, MILTON_DECIMALS)
  } catch (error) {
    logger.error('Error getting MILTON total supply:', error)
    throw new CustomError(ErrorType.TokenInfoError, 'Failed to get MILTON total supply')
  }
}

/**
 * Format MILTON token amount to display with proper decimals
 * @param amount Raw token amount
 * @returns Formatted MILTON token amount as a string
 */
export function formatMiltonAmount(amount: number): string {
  return amount.toFixed(MILTON_DECIMALS)
}

/**
 * Parse MILTON token amount from user input
 * @param input User input string
 * @returns Parsed MILTON token amount as a number
 */
export function parseMiltonAmount(input: string): number {
  const parsed = parseFloat(input)
  if (isNaN(parsed)) {
    throw new CustomError(ErrorType.InvalidInput, 'Invalid MILTON token amount')
  }
  return parsed
}