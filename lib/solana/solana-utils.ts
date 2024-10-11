import { Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, Keypair } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createTransferInstruction,
  getMint,
  getAccount,
  createMintToInstruction,
} from '@solana/spl-token';
import { CustomError, ErrorType } from '../custom-error';

const connection = new Connection(process.env.SOLANA_RPC_URL!, 'confirmed');

// Constants for SPL tokens, USDC, and MILTON Token addresses.
const USDC_MINT_ADDRESS = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
const MILTON_MINT_ADDRESS = new PublicKey('Your_Milton_Token_Mint_Address'); // Replace with actual MILTON mint address

/**
 * Creates a new Solana wallet.
 */
export async function createSolanaWallet(): Promise<{ publicKey: string; privateKey: string }> {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toBase58(),
    privateKey: Buffer.from(keypair.secretKey).toString('base64'),
  };
}

/**
 * Gets SOL balance for a given public key.
 */
export async function getSolanaBalance(publicKey: string): Promise<number> {
  try {
    const balance = await connection.getBalance(new PublicKey(publicKey));
    return balance / 1e9; // Convert lamports to SOL
  } catch (error) {
    console.error('Error getting Solana balance:', error);
    throw new CustomError(ErrorType.SolanaError, 'Failed to get Solana balance');
  }
}

/**
 * Transfers SOL between wallets.
 */
export async function transferSOL(
  fromPrivateKey: string,
  toPublicKey: string,
  amount: number
): Promise<string> {
  try {
    const fromKeypair = Keypair.fromSecretKey(Buffer.from(fromPrivateKey, 'base64'));
    const toPublicKeyObj = new PublicKey(toPublicKey);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toPublicKeyObj,
        lamports: amount * 1e9, // Convert SOL to lamports
      })
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [fromKeypair]);
    return signature;
  } catch (error) {
    console.error('Error transferring SOL:', error);
    throw new CustomError(ErrorType.SolanaError, 'Failed to transfer SOL');
  }
}

/**
 * Transfers SPL tokens, including USDC and MILTON tokens.
 */
export async function transferSPLToken(
  tokenMint: PublicKey,
  fromPrivateKey: string,
  toPublicKey: string,
  amount: number
): Promise<string> {
  try {
    const fromKeypair = Keypair.fromSecretKey(Buffer.from(fromPrivateKey, 'base64'));
    const toPublicKeyObj = new PublicKey(toPublicKey);

    const fromTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      fromKeypair.publicKey
    );

    const toTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      toPublicKeyObj
    );

    const transaction = new Transaction().add(
      createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        fromKeypair.publicKey,
        amount
      )
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [fromKeypair]);
    return signature;
  } catch (error) {
    console.error('Error transferring SPL token:', error);
    throw new CustomError(ErrorType.SolanaError, 'Failed to transfer SPL token');
  }
}

/**
 * Transfers USDC (SPL token).
 */
export async function transferUSDC(
  fromPrivateKey: string,
  toPublicKey: string,
  amount: number
): Promise<string> {
  return transferSPLToken(USDC_MINT_ADDRESS, fromPrivateKey, toPublicKey, amount);
}

/**
 * Transfers MILTON token (SPL token).
 */
export async function transferMILTONToken(
  fromPrivateKey: string,
  toPublicKey: string,
  amount: number
): Promise<string> {
  return transferSPLToken(MILTON_MINT_ADDRESS, fromPrivateKey, toPublicKey, amount);
}

/**
 * Creates a token account for the given SPL token.
 */
export async function createTokenAccount(
  tokenMint: PublicKey,
  owner: PublicKey
): Promise<PublicKey> {
  try {
    const associatedTokenAddress = await getAssociatedTokenAddress(
      tokenMint,
      owner
    );

    const transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        owner,
        associatedTokenAddress,
        owner,
        tokenMint
      )
    );

    await sendAndConfirmTransaction(connection, transaction, []);
    return associatedTokenAddress;
  } catch (error) {
    console.error('Error creating token account:', error);
    throw new CustomError(ErrorType.SolanaError, 'Failed to create token account');
  }
}

/**
 * Mints SPL tokens.
 */
export async function mintToken(
  tokenMint: PublicKey,
  mintAuthority: Keypair,
  destinationAccount: PublicKey,
  amount: number
): Promise<string> {
  try {
    const transaction = new Transaction().add(
      createMintToInstruction(
        tokenMint,
        destinationAccount,
        mintAuthority.publicKey,
        amount
      )
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [mintAuthority]);
    return signature;
  } catch (error) {
    console.error('Error minting token:', error);
    throw new CustomError(ErrorType.SolanaError, 'Failed to mint token');
  }
}

/**
 * Gets SPL token balance for a specific token account, including USDC or MILTON tokens.
 */
export async function getTokenBalance(
  tokenMint: PublicKey,
  owner: PublicKey
): Promise<number> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      owner
    );

    const accountInfo = await getAccount(connection, tokenAccount);
    const mintInfo = await getMint(connection, tokenMint);

    return Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals);
  } catch (error) {
    console.error('Error getting token balance:', error);
    throw new CustomError(ErrorType.SolanaError, 'Failed to get token balance');
  }
}