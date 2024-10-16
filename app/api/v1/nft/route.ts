import { NextRequest, NextResponse } from 'next/server'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { Metaplex, keypairIdentity, bundlrStorage } from '@metaplex-foundation/js'
import { z } from 'zod'

// Set up the Solana RPC endpoint and NFT creator's private key
const SOLANA_RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com'
const NFT_CREATOR_PRIVATE_KEY = process.env.NFT_CREATOR_PRIVATE_KEY

// Check if the NFT_CREATOR_PRIVATE_KEY environment variable is set
if (!NFT_CREATOR_PRIVATE_KEY) {
  throw new Error('NFT_CREATOR_PRIVATE_KEY environment variable is not set')
}

// Create a new connection to the Solana blockchain
const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed')

// Create a keypair for the NFT creator using the provided private key
const nftCreatorKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(NFT_CREATOR_PRIVATE_KEY)))

// Initialize the Metaplex instance with the connection and keypair
const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(nftCreatorKeypair))
  .use(bundlrStorage())

// Define a schema for NFT minting input using zod
const NFTMintSchema = z.object({
  name: z.string().min(1).max(32),
  description: z.string().max(1000),
  imageUrl: z.string().url(),
  attributes: z.array(z.object({
    trait_type: z.string(),
    value: z.string()
  })).optional(),
})

// Handle POST requests to mint a new NFT
export async function POST(request: NextRequest) {
  try {
    // Parse the request body and validate input
    const body = await request.json()
    const { name, description, imageUrl, attributes } = NFTMintSchema.parse(body)

    // Create a new NFT with the provided details
    const { nft } = await metaplex.nfts().create({
      name: name,
      description: description,
      uri: imageUrl,
      sellerFeeBasisPoints: 500, // 5% royalty
      properties: {
        files: [{ uri: imageUrl, type: 'image/png' }],
        category: 'image',
        creators: [{ address: nftCreatorKeypair.publicKey, share: 100 }],
      },
      attributes: attributes,
    })

    // Return the minted NFT details in the response
    return NextResponse.json({
      success: true,
      mintAddress: nft.address.toBase58(),
      name: nft.name,
      description: nft.description,
      imageUrl: nft.uri,
    })
  } catch (error) {
    console.error('NFT minting error:', error)

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 })
    }

    // Handle unexpected errors
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

// Handle GET requests to retrieve NFT details by mint address
export async function GET(request: NextRequest) {
  const mintAddress = request.nextUrl.searchParams.get('mintAddress')

  // Check if the mint address is provided
  if (!mintAddress) {
    return NextResponse.json({ error: 'Missing mint address' }, { status: 400 })
  }

  try {
    // Retrieve the NFT details using the mint address
    const mintPublicKey = new PublicKey(mintAddress)
    const nft = await metaplex.nfts().findByMint({ mintAddress: mintPublicKey })

    // Return the NFT details in the response
    return NextResponse.json({
      mintAddress: nft.address.toBase58(),
      name: nft.name,
      description: nft.description,
      imageUrl: nft.uri,
      attributes: nft.attributes,
      owner: nft.ownership.owner.toBase58(),
    })
  } catch (error) {
    console.error('NFT retrieval error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
