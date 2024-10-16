import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createTransferInstruction,
} from '@solana/spl-token';
import { Metaplex, keypairIdentity, bundlrStorage, Nft, NftWithToken } from '@metaplex-foundation/js';
import { logger } from './logger';

export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes?: { trait_type: string; value: string }[];
}

export async function initializeMetaplex(connection: Connection, payer: Keypair): Promise<Metaplex> {
  return Metaplex.make(connection)
    .use(keypairIdentity(payer))
    .use(bundlrStorage());
}

export async function fetchNFTMetadata(
  metaplex: Metaplex,
  mintAddress: PublicKey
): Promise<NFTMetadata | null> {
  try {
    const nft = await metaplex.nfts().findByMint({ mintAddress });
    const metadata = await fetch(nft.uri).then(res => res.json());
    return {
      name: nft.name,
      symbol: nft.symbol,
      description: metadata.description,
      image: metadata.image,
      attributes: metadata.attributes,
    };
  } catch (error) {
    logger.error('Error fetching NFT metadata:', error);
    return null;
  }
}

export async function getNFTsOwnedByWallet(
  metaplex: Metaplex,
  owner: PublicKey
): Promise<NftWithToken[]> {
  try {
    const nfts = await metaplex.nfts().findAllByOwner({ owner });
    return nfts;
  } catch (error) {
    logger.error('Error fetching NFTs owned by wallet:', error);
    return [];
  }
}

export async function verifyNFTOwnership(
  connection: Connection,
  nftMint: PublicKey,
  owner: PublicKey
): Promise<boolean> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(nftMint, owner);
    const accountInfo = await connection.getAccountInfo(tokenAccount);
    return accountInfo !== null && accountInfo.owner.equals(TOKEN_PROGRAM_ID);
  } catch (error) {
    logger.error('Error verifying NFT ownership:', error);
    return false;
  }
}

export async function createNFTTransferTransaction(
  connection: Connection,
  nftMint: PublicKey,
  fromWallet: PublicKey,
  toWallet: PublicKey
): Promise<Transaction> {
  const fromTokenAccount = await getAssociatedTokenAddress(nftMint, fromWallet);
  const toTokenAccount = await getAssociatedTokenAddress(nftMint, toWallet);

  const transaction = new Transaction();

  // Check if the recipient's token account exists
  const toTokenAccountInfo = await connection.getAccountInfo(toTokenAccount);
  if (!toTokenAccountInfo) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        fromWallet,
        toTokenAccount,
        toWallet,
        nftMint
      )
    );
  }

  transaction.add(
    createTransferInstruction(
      fromTokenAccount,
      toTokenAccount,
      fromWallet,
      1
    )
  );

  return transaction;
}

export async function estimateNFTTransferFee(
  connection: Connection,
  nftMint: PublicKey,
  fromWallet: PublicKey,
  toWallet: PublicKey
): Promise<number> {
  try {
    const transaction = await createNFTTransferTransaction(connection, nftMint, fromWallet, toWallet);
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromWallet;

    const fee = await connection.getFeeForMessage(transaction.compileMessage());
    return fee.value;
  } catch (error) {
    logger.error('Error estimating NFT transfer fee:', error);
    throw new Error('Failed to estimate NFT transfer fee');
  }
}

export function isValidNFTMintAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export function shortenNFTAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}