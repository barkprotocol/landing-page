import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  Keypair,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import bs58 from 'bs58';

// Replace with your Solana network RPC URL
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

export async function createSolanaAccount(): Promise<{ publicKey: string; privateKey: string }> {
  const account = Keypair.generate();
  return {
    publicKey: account.publicKey.toString(),
    privateKey: bs58.encode(account.secretKey),
  };
}

export async function getSolanaBalance(publicKey: string): Promise<number> {
  try {
    const balance = await connection.getBalance(new PublicKey(publicKey));
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error getting Solana balance:', error);
    throw new Error('Failed to get Solana balance');
  }
}

export async function transferSOL(
  fromPrivateKey: string,
  toPublicKey: string,
  amount: number
): Promise<string> {
  try {
    const fromKeypair = Keypair.fromSecretKey(bs58.decode(fromPrivateKey));
    const toPublicKeyObj = new PublicKey(toPublicKey);
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toPublicKeyObj,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );
    const signature = await sendAndConfirmTransaction(connection, transaction, [fromKeypair]);
    return signature;
  } catch (error) {
    console.error('Error transferring SOL:', error);
    throw new Error('Failed to transfer SOL');
  }
}

export async function createTokenAccount(
  ownerPublicKey: string,
  tokenMintAddress: string
): Promise<string> {
  try {
    const ownerPublicKeyObj = new PublicKey(ownerPublicKey);
    const tokenMintAddressObj = new PublicKey(tokenMintAddress);
    const associatedTokenAddress = await getAssociatedTokenAddress(
      tokenMintAddressObj,
      ownerPublicKeyObj
    );
    const transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        ownerPublicKeyObj,
        associatedTokenAddress,
        ownerPublicKeyObj,
        tokenMintAddressObj
      )
    );
    const signature = await sendAndConfirmTransaction(connection, transaction, []);
    return associatedTokenAddress.toString();
  } catch (error) {
    console.error('Error creating token account:', error);
    throw new Error('Failed to create token account');
  }
}

export async function getTokenBalance(
  tokenAccountAddress: string
): Promise<number> {
  try {
    const tokenAccountInfo = await connection.getTokenAccountBalance(new PublicKey(tokenAccountAddress));
    return parseFloat(tokenAccountInfo.value.amount) / Math.pow(10, tokenAccountInfo.value.decimals);
  } catch (error) {
    console.error('Error getting token balance:', error);
    throw new Error('Failed to get token balance');
  }
}

export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export async function getRecentBlockhash(): Promise<string> {
  try {
    const { blockhash } = await connection.getLatestBlockhash();
    return blockhash;
  } catch (error) {
    console.error('Error getting recent blockhash:', error);
    throw new Error('Failed to get recent blockhash');
  }
}

export async function estimateTransactionFee(transaction: Transaction): Promise<number> {
  try {
    const { feeCalculator } = await connection.getRecentBlockhash();
    const fee = feeCalculator.lamportsPerSignature * transaction.signatures.length;
    return fee / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error estimating transaction fee:', error);
    throw new Error('Failed to estimate transaction fee');
  }
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export async function getTokenAccountsByOwner(ownerPublicKey: string): Promise<string[]> {
  try {
    const ownerPublicKeyObj = new PublicKey(ownerPublicKey);
    const tokenAccounts = await connection.getTokenAccountsByOwner(ownerPublicKeyObj, {
      programId: TOKEN_PROGRAM_ID,
    });
    return tokenAccounts.value.map(account => account.pubkey.toString());
  } catch (error) {
    console.error('Error getting token accounts:', error);
    throw new Error('Failed to get token accounts');
  }
}