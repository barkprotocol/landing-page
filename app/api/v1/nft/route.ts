import { NextRequest, NextResponse } from 'next/server'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { Metaplex, keypairIdentity, bundlrStorage } from '@metaplex-foundation/js'
import { z } from 'zod'

const SOLANA_RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com'
const NFT_CREATOR_PRIVATE_KEY = process.env.NFT_CREATOR_PRIVATE_KEY

if (!NFT_CREATOR_PRIVATE_KEY) {
  throw new Error('NFT_CREATOR_PRIVATE_KEY environment variable is not set')
}

const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed')
const nftCreatorKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(NFT_CREATOR_PRIVATE_KEY)))

const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(nftCreatorKeypair))
  .use(bundlrStorage())

const NFTMintSchema = z.object({
  name: z.string().min(1).max(32),
  description: z.string().max(1000),
  imageUrl: z.string().url(),
  attributes: z.array(z.object({
    trait_type: z.string(),
    value: z.string()
  })).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, imageUrl, attributes } = NFTMintSchema.parse(body)

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

    return NextResponse.json({
      success: true,
      mintAddress: nft.address.toBase58(),
      name: nft.name,
      description: nft.description,
      imageUrl: nft.uri,
    })
  } catch (error) {
    console.error('NFT minting error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const mintAddress = request.nextUrl.searchParams.get('mintAddress')

  if (!mintAddress) {
    return NextResponse.json({ error: 'Missing mint address' }, { status: 400 })
  }

  try {
    const mintPublicKey = new PublicKey(mintAddress)
    const nft = await metaplex.nfts().findByMint({ mintAddress: mintPublicKey })

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