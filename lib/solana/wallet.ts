import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { SOLANA_RPC_ENDPOINT, MILTON_MINT_ADDRESS, TOKEN_INFO } from './constants';

const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');

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

export async function getWalletBalance(publicKey: PublicKey): Promise<number> {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    throw new Error('Failed to get wallet balance');
  }
}

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

export async function transferSOL(
  wallet: WalletContextState,
  recipient: PublicKey,
  amount: number
): Promise<string> {
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
      SystemProgram.transfer({
        fromPubkey: sourceAccount,
        toPubkey: destinationAccount,
        lamports: amount * Math.pow(10, tokenInfo.decimals),
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
    console.error('Error transferring token:', error);
    throw new Error('Failed to transfer token');
  }
}

export async function createAssociatedTokenAccount(
  wallet: WalletContextState,
  mintAddress: PublicKey
): Promise<PublicKey> {
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
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: associatedTokenAddress,
        lamports: 0,
      }),
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

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}