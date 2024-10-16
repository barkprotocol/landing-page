import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  createSetAuthorityInstruction,
  AuthorityType,
} from '@solana/spl-token';
import { Metaplex, keypairIdentity, bundlrStorage } from '@metaplex-foundation/js';
import { logger } from './logger';

const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes?: { trait_type: string; value: string }[];
}

export async function mintNFT(
  connection: Connection,
  payer: Keypair,
  metadata: NFTMetadata
): Promise<string> {
  try {
    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(payer))
      .use(bundlrStorage());

    const { nft } = await metaplex.nfts().create({
      uri: await uploadMetadata(metaplex, metadata),
      name: metadata.name,
      sellerFeeBasisPoints: 500, // 5% royalty
    });

    logger.info(`NFT created with address: ${nft.address.toBase58()}`);
    return nft.address.toBase58();
  } catch (error) {
    logger.error('Error minting NFT:', error);
    throw new Error('Failed to mint NFT');
  }
}

async function uploadMetadata(metaplex: Metaplex, metadata: NFTMetadata): Promise<string> {
  try {
    const { uri } = await metaplex.nfts().uploadMetadata(metadata);
    logger.info(`Metadata uploaded with URI: ${uri}`);
    return uri;
  } catch (error) {
    logger.error('Error uploading metadata:', error);
    throw new Error('Failed to upload metadata');
  }
}

export async function transferNFT(
  connection: Connection,
  payer: Keypair,
  nftMint: PublicKey,
  recipient: PublicKey
): Promise<string> {
  try {
    const fromTokenAccount = await getAssociatedTokenAddress(nftMint, payer.publicKey);
    const toTokenAccount = await getAssociatedTokenAddress(nftMint, recipient);

    const transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        payer.publicKey,
        toTokenAccount,
        recipient,
        nftMint
      ),
      createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        payer.publicKey,
        1
      )
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [payer]);
    logger.info(`NFT transferred with signature: ${signature}`);
    return signature;
  } catch (error) {
    logger.error('Error transferring NFT:', error);
    throw new Error('Failed to transfer NFT');
  }
}

function createTransferInstruction(
  source: PublicKey,
  destination: PublicKey,
  owner: PublicKey,
  amount: number
): TransactionInstruction {
  return new TransactionInstruction({
    keys: [
      { pubkey: source, isSigner: false, isWritable: true },
      { pubkey: destination, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
    ],
    programId: TOKEN_PROGRAM_ID,
    data: Buffer.from([3, ...new BN(amount).toArray('le', 8)]),
  });
}

export async function burnNFT(
  connection: Connection,
  payer: Keypair,
  nftMint: PublicKey
): Promise<string> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(nftMint, payer.publicKey);

    const transaction = new Transaction().add(
      createBurnInstruction(
        tokenAccount,
        nftMint,
        payer.publicKey,
        1
      )
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [payer]);
    logger.info(`NFT burned with signature: ${signature}`);
    return signature;
  } catch (error) {
    logger.error('Error burning NFT:', error);
    throw new Error('Failed to burn NFT');
  }
}

function createBurnInstruction(
  account: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
  amount: number
): TransactionInstruction {
  return new TransactionInstruction({
    keys: [
      { pubkey: account, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
    ],
    programId: TOKEN_PROGRAM_ID,
    data: Buffer.from([8, ...new BN(amount).toArray('le', 8)]),
  });
}

class BN {
  constructor(number: number) {
    this.number = BigInt(number);
  }

  toArray(endian: 'le' | 'be', length: number): number[] {
    const bytes = [];
    let value = this.number;

    for (let i = 0; i < length; i++) {
      bytes.push(Number(value & BigInt(255)));
      value >>= BigInt(8);
    }

    return endian === 'le' ? bytes : bytes.reverse();
  }

  private number: bigint;
}