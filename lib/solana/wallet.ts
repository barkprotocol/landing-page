import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { SOLANA_RPC_ENDPOINT, TOKEN_INFO } from './constants';

// Initialize a connection to the Solana blockchain
const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');

/**
 * Connects the wallet to the Solana network.
 * @param wallet The wallet context state.
 * @throws Will throw an error if the wallet cannot connect.
 */
export async function connectWallet(wallet: WalletContextState): Promise<void> {
  if (!wallet.connected && wallet.connect) {
    try {
      await wallet.connect();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw new Error('Failed to connect wallet');
    }
  }
}

/**
 * Disconnects the wallet from the Solana network.
 * @param wallet The wallet context state.
 * @throws Will throw an error if the wallet cannot disconnect.
 */
export async function disconnectWallet(wallet: WalletContextState): Promise<void> {
  if (wallet.connected && wallet.disconnect) {
    try {
      await wallet.disconnect();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      throw new Error('Failed to disconnect wallet');
    }
  }
}

/**
 * Retrieves the SOL balance of a specified wallet.
 * @param publicKey The public key of the wallet.
 * @returns The balance in SOL.
 * @throws Will throw an error if the balance cannot be retrieved.
 */
export async function getWalletBalance(publicKey: PublicKey): Promise<number> {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    throw new Error('Failed to get wallet balance');
  }
}

/**
 * Retrieves the token balance of a specified wallet for a given mint address.
 * @param publicKey The public key of the wallet.
 * @param mintAddress The mint address of the token.
 * @returns The token balance.
 * @throws Will throw an error if the token balance cannot be retrieved.
 */
export async function getTokenBalance(publicKey: PublicKey, mintAddress: PublicKey): Promise<number> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(mintAddress, publicKey);
    const balance = await connection.getTokenAccountBalance(tokenAccount);
    
    const tokenInfo = Object.values(TOKEN_INFO).find(token => token.mintAddress.equals(mintAddress));
    if (!tokenInfo) {
      throw new Error('Token info not found');
    }

    return parseFloat(balance.value.amount) / Math.pow(10, tokenInfo.decimals);
  } catch (error) {
    console.error('Error getting token balance:', error);
    throw new Error('Failed to get token balance');
  }
}

/**
 * Transfers SOL from the connected wallet to a recipient.
 * @param wallet The wallet context state.
 * @param recipient The public key of the recipient.
 * @param amount The amount of SOL to transfer.
 * @returns The transaction signature.
 * @throws Will throw an error if the transfer fails.
 */
export async function transferSOL(wallet: WalletContextState, recipient: PublicKey, amount: number): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  try {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: recipient,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    transaction.feePayer = wallet.publicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const signed = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(signature);

    return signature;
  } catch (error) {
    console.error('Error transferring SOL:', error);
    throw new Error('Failed to transfer SOL');
  }
}

/**
 * Transfers tokens from the connected wallet to a recipient.
 * @param wallet The wallet context state.
 * @param recipient The public key of the recipient.
 * @param mintAddress The mint address of the token.
 * @param amount The amount of tokens to transfer.
 * @returns The transaction signature.
 * @throws Will throw an error if the transfer fails.
 */
export async function transferToken(
  wallet: WalletContextState,
  recipient: PublicKey,
  mintAddress: PublicKey,
  amount: number
): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  try {
    const sourceAccount = await getAssociatedTokenAddress(mintAddress, wallet.publicKey);
    const destinationAccount = await getAssociatedTokenAddress(mintAddress, recipient);

    const tokenInfo = Object.values(TOKEN_INFO).find(token => token.mintAddress.equals(mintAddress));
    if (!tokenInfo) {
      throw new Error('Token info not found');
    }

    const transaction = new Transaction().add(
      // Use Token.createTransferInstruction instead of SystemProgram.transfer for token transfers
      Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        sourceAccount,
        destinationAccount,
        wallet.publicKey,
        [],
        amount * Math.pow(10, tokenInfo.decimals) // Adjusting amount based on decimals
      )
    );

    transaction.feePayer = wallet.publicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const signed = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(signature);

    return signature;
  } catch (error) {
    console.error('Error transferring token:', error);
    throw new Error('Failed to transfer token');
  }
}

/**
 * Creates an associated token account for the connected wallet and a specified mint address.
 * @param wallet The wallet context state.
 * @param mintAddress The mint address of the token.
 * @returns The associated token account's public key.
 * @throws Will throw an error if the account creation fails.
 */
export async function createAssociatedTokenAccount(wallet: WalletContextState, mintAddress: PublicKey): Promise<PublicKey> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected');
  }

  try {
    const associatedTokenAddress = await getAssociatedTokenAddress(mintAddress, wallet.publicKey);

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: associatedTokenAddress,
        space: 165,
        lamports: await connection.getMinimumBalanceForRentExemption(165),
        programId: TOKEN_PROGRAM_ID,
      }),
      // This is unnecessary for creating the associated token account, you can directly use createAccount instruction
      SystemProgram.assign({
        accountPubkey: associatedTokenAddress,
        programId: TOKEN_PROGRAM_ID,
      })
    );

    transaction.feePayer = wallet.publicKey;
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const signed = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(signature);

    return associatedTokenAddress;
  } catch (error) {
    console.error('Error creating associated token account:', error);
    throw new Error('Failed to create associated token account');
  }
}

/**
 * Shortens a Solana address for display purposes.
 * @param address The full address.
 * @param chars The number of characters to show at the beginning and end.
 * @returns The shortened address.
 */
export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Validates if a given string is a valid Solana address.
 * @param address The address to validate.
 * @returns True if valid, otherwise false.
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}
