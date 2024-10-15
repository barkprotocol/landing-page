import { NextRequest, NextResponse } from 'next/server';
import { PublicKey, Keypair } from '@solana/web3.js';
import { bundlrStorage, keypairIdentity, Metaplex, NftWithToken } from '@metaplex-foundation/js';
import { rateLimit } from '@/lib/rate-limit';

// Assume this is your keypair for signing transactions (replace with proper key management)
const keypair = Keypair.generate(); // For testing, replace with your wallet keypair

// Metaplex client initialization
const createMetaplexClient = (connection: any) => {
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(keypair))
    .use(bundlrStorage()); // or .use(arweaveStorage()) for decentralized storage
  return metaplex;
};

// Example metadata generation
const generateMetadata = (name: string, symbol: string, description: string, imageUri: string) => ({
  name,
  symbol,
  uri: imageUri, // Image URI for the NFT
  sellerFeeBasisPoints: 500, // 5% royalties
  creators: [{ address: keypair.publicKey.toBase58(), share: 100 }],
  description,
  attributes: [
    { trait_type: 'Background', value: 'Orange' },
    { trait_type: 'Accessory', value: 'Bolt' },
  ],
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const { success } = await rateLimit(request);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Parse request body (assumes image and metadata input)
    const { name, symbol, description, image } = await request.json();

    if (!name || !symbol || !description || !image) {
      return NextResponse.json({ error: 'Missing required NFT data' }, { status: 400 });
    }

    // Establish a connection to Solana (mainnet-beta, devnet, etc.)
    const connection = new PublicKey(process.env.NEXT_PUBLIC_SOLANA_NETWORK!);

    // Create Metaplex client
    const metaplex = createMetaplexClient(connection);

    // Upload the image (to Bundlr, Arweave, or any other storage)
    const { uri: imageUri } = await metaplex.storage().upload(image);
    
    if (!imageUri) {
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }

    // Generate NFT metadata
    const metadata = generateMetadata(name, symbol, description, imageUri);

    // Mint NFT with generated metadata
    const { nft } = await metaplex.nfts().create({
      uri: metadata.uri,
      name: metadata.name,
      symbol: metadata.symbol,
      sellerFeeBasisPoints: metadata.sellerFeeBasisPoints,
      creators: metadata.creators,
    });

    const response = {
      mintAddress: nft.mintAddress.toBase58(),
      metadata,
      imageUri,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in POST /api/v1/generate-nft:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
