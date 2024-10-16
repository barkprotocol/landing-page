import { NextRequest, NextResponse } from 'next/server';
import {
  createMetadata,
  MetadataData,
} from '@metaplex-foundation/mpl-token-metadata';
import { Connection, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { CustomError, ErrorType } from '@/lib/custom-error'; // Adjusted import path
import { getWallet } from '@/lib/solana/solana-pay-utils'; // Adjusted import path

const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL, 'confirmed');

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, symbol, uri, sellerFeeBasisPoints, creators } = body;

  const wallet = await getWallet(); // Get wallet adapter instance
  if (!wallet) {
    throw new CustomError(ErrorType.Unauthorized, 'Wallet not connected');
  }

  const metadataData: MetadataData = { // Ensure the type is MetadataData
    name,
    symbol,
    uri,
    sellerFeeBasisPoints,
    creators: creators || null,
  };

  try {
    // Create the transaction
    const transaction = new Transaction().add(
      createMetadata({
        metadata: new PublicKey('YourMetadataPublicKey'), // Replace with actual metadata public key
        metadataData,
        mint: new PublicKey('YourTokenMintAddress'), // Replace with your token mint address
        updateAuthority: wallet.publicKey,
        payer: wallet.publicKey,
      })
    );

    // Send the transaction and wait for confirmation
    const signature = await sendAndConfirmTransaction(connection, transaction, [wallet]);

    return NextResponse.json({ signature });
  } catch (error) {
    // Catch and handle any errors that occur
    throw new CustomError(ErrorType.NFTMintFailed, 'Metadata creation failed', error);
  }
}
