import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  Keypair,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  getAccount,
  createTransferInstruction,
} from '@solana/spl-token';
import { SOLANA_RPC_ENDPOINT, MILTON_MINT, USDC_MINT, MILTON_DECIMALS, USDC_DECIMALS, TRANSACTION_FEE } from './config';

const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');

/**
 * Validates the transfer amount.
 * @param amount - The amount to validate.
 * @throws Will throw an error if the amount is not greater than zero.
 */
function validateAmount(amount: number): void {
  if (amount <= 0) {
    throw new Error('Amount must be greater than zero.');
  }
}

/**
 * Retrieves the SOL balance of a given public key.
 * @param publicKey - The public key of the account.
 * @returns The balance in SOL.
 * @throws Will throw an error if the balance cannot be retrieved.
 */
export async function getBalance(publicKey: PublicKey): Promise<number> {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error getting balance:', error);
    throw new Error('Failed to get balance');
  }
}

/**
 * Transfers SOL from one account to another.
 * @param from - The Keypair of the sender.
 * @param to - The public key of the recipient.
 * @param amount - The amount of SOL to transfer.
 * @returns The transaction signature.
 * @throws Will throw an error if the transfer fails.
 */
export async function transferSOL(from: Keypair, to: PublicKey, amount: number): Promise<string> {
  validateAmount(amount);
  try {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: to,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [from]);
    return signature;
  } catch (error) {
    console.error('Error transferring SOL:', error);
    throw new Error('Failed to transfer SOL');
  }
}

/**
 * Retrieves the balance of a specified SPL token for a given owner.
 * @param owner - The public key of the token owner.
 * @param mint - The public key of the token mint.
 * @returns The token balance.
 * @throws Will throw an error if the balance cannot be retrieved.
 */
export async function getTokenBalance(owner: PublicKey, mint: PublicKey): Promise<number> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(mint, owner);
    const balance = await connection.getTokenAccountBalance(tokenAccount);
    const decimals = mint.equals(MILTON_MINT) ? MILTON_DECIMALS : USDC_DECIMALS;
    return parseFloat(balance.value.amount) / Math.pow(10, decimals);
  } catch (error) {
    console.error('Error getting token balance:', error);
    throw new Error('Failed to get token balance');
  }
}

/**
 * Creates an associated token account for a specific token mint and owner.
 * @param payer - The Keypair of the payer.
 * @param owner - The public key of the account owner.
 * @param mint - The public key of the token mint.
 * @returns The public key of the created associated token account.
 * @throws Will throw an error if the account creation fails.
 */
export async function createAssociatedTokenAccount(
  payer: Keypair,
  owner: PublicKey,
  mint: PublicKey
): Promise<PublicKey> {
  try {
    const associatedTokenAddress = await getAssociatedTokenAddress(mint, owner);
    const transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        payer.publicKey,
        associatedTokenAddress,
        owner,
        mint
      )
    );

    await sendAndConfirmTransaction(connection, transaction, [payer]);
    return associatedTokenAddress;
  } catch (error) {
    console.error('Error creating associated token account:', error);
    throw new Error('Failed to create associated token account');
  }
}

/**
 * Transfers a specified amount of SPL tokens from one account to another.
 * @param from - The Keypair of the sender.
 * @param to - The public key of the recipient.
 * @param mint - The public key of the token mint.
 * @param amount - The amount of tokens to transfer.
 * @returns The transaction signature.
 * @throws Will throw an error if the transfer fails.
 */
export async function transferToken(
  from: Keypair,
  to: PublicKey,
  mint: PublicKey,
  amount: number
): Promise<string> {
  validateAmount(amount);
  try {
    const fromTokenAccount = await getAssociatedTokenAddress(mint, from.publicKey);
    const toTokenAccount = await getAssociatedTokenAddress(mint, to);

    const transaction = new Transaction();

    // Check if the recipient's token account exists
    const toTokenAccountInfo = await connection.getAccountInfo(toTokenAccount);
    if (!toTokenAccountInfo) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          from.publicKey,
          toTokenAccount,
          to,
          mint
        )
      );
    }

    const decimals = mint.equals(MILTON_MINT) ? MILTON_DECIMALS : USDC_DECIMALS;
    const tokenAmount = amount * Math.pow(10, decimals);

    transaction.add(
      createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        from.publicKey,
        tokenAmount
      )
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [from]);
    return signature;
  } catch (error) {
    console.error('Error transferring token:', error);
    throw new Error('Failed to transfer token');
  }
}
