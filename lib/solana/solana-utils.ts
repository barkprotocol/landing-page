import {
  Connection,
  Keypair,
  Transaction,
  PublicKey,
  SystemProgram,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { WalletAdapter } from '@solana/wallet-adapter-base';
import { CustomError, ErrorType } from '../custom-error';

// Initialize connection to the Solana cluster
const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL, 'confirmed');

/**
 * Create a new wallet account
 * @returns Keypair of the new wallet
 */
export function createWallet(): Keypair {
  return Keypair.generate();
}

/**
 * Airdrop SOL to the given wallet address
 * @param walletAddress - Public key of the wallet
 * @param amount - Amount of SOL to airdrop
 * @returns Promise that resolves to the transaction signature
 */
export async function airdropSOL(walletAddress: PublicKey, amount: number): Promise<string> {
  const signature = await connection.requestAirdrop(walletAddress, amount * 1e9); // Convert to lamports (1 SOL = 1e9 lamports)
  await connection.confirmTransaction(signature);
  return signature;
}

/**
 * Transfer SOL from one wallet to another
 * @param fromWallet - Sender's wallet
 * @param toWallet - Recipient's wallet
 * @param amount - Amount of SOL to send
 * @returns Promise that resolves to the transaction signature
 */
export async function transferSOL(
  fromWallet: WalletAdapter,
  toWallet: PublicKey,
  amount: number
): Promise<string> {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromWallet.publicKey,
      toPubkey: toWallet,
      lamports: amount * 1e9, // Convert to lamports
    })
  );

  try {
    const signature = await sendAndConfirmTransaction(connection, transaction, [fromWallet]);
    return signature;
  } catch (error) {
    throw new CustomError(ErrorType.TransactionFailed, 'SOL transfer failed', error);
  }
}

/**
 * Create a new token account for a given mint
 * @param wallet - Wallet adapter for the user
 * @param mintAddress - Address of the token mint
 * @returns Promise that resolves to the token account public key
 */
export async function createTokenAccount(wallet: WalletAdapter, mintAddress: PublicKey): Promise<PublicKey> {
  const token = new Token(connection, mintAddress, TOKEN_PROGRAM_ID, wallet);
  const tokenAccount = await token.createAccount(wallet.publicKey);
  return tokenAccount;
}

/**
 * Get the balance of a token account
 * @param tokenAccount - Public key of the token account
 * @returns Promise that resolves to the balance
 */
export async function getTokenBalance(tokenAccount: PublicKey): Promise<number> {
  const tokenInfo = await connection.getTokenAccountBalance(tokenAccount);
  return tokenInfo.value.amount; // Returns the balance as a string
}

/**
 * Transfer tokens from one account to another
 * @param wallet - Wallet adapter for the sender
 * @param fromTokenAccount - Source token account
 * @param toTokenAccount - Destination token account
 * @param amount - Amount of tokens to transfer
 * @returns Promise that resolves to the transaction signature
 */
export async function transferTokens(
  wallet: WalletAdapter,
  fromTokenAccount: PublicKey,
  toTokenAccount: PublicKey,
  amount: number
): Promise<string> {
  const transaction = new Transaction().add(
    Token.createTransferInstruction(TOKEN_PROGRAM_ID, fromTokenAccount, toTokenAccount, wallet.publicKey, [], amount)
  );

  try {
    const signature = await sendAndConfirmTransaction(connection, transaction, [wallet]);
    return signature;
  } catch (error) {
    throw new CustomError(ErrorType.NFTTransferFailed, 'Token transfer failed', error);
  }
}
