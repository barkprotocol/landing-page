import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer } from '@solana/spl-token'
import { sign } from 'tweetnacl'
import bs58 from 'bs58'

// Mock data for NFTs
let nfts = [
  { id: 1, name: 'Milton Avatar #1', owner: 'Gq7GW...', image: 'https://example.com/nft1.png', isGenerated: false, isSent: false },
  { id: 2, name: 'Milton Generated NFT Art #1', owner: 'Hx9Kp...', image: 'https://example.com/nft2.png', isGenerated: true, isSent: false },
  { id: 3, name: 'Milton Token Rewards', owner: 'Jm2Rt...', image: 'https://example.com/nft3.png', isGenerated: false, isSent: true },
]

const NFTSchema = z.object({
  id: z.number(),
  name: z.string(),
  owner: z.string(),
  image: z.string().url(),
  isGenerated: z.boolean(),
  isSent: z.boolean(),
})

const NFTsArraySchema = z.array(NFTSchema)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const owner = searchParams.get('owner')
    const isGenerated = searchParams.get('generated') === 'true'
    const isSent = searchParams.get('sent') === 'true'

    let filteredNFTs = [...nfts]

    if (owner) {
      filteredNFTs = filteredNFTs.filter(nft => nft.owner === owner)
    }

    if (isGenerated !== null) {
      filteredNFTs = filteredNFTs.filter(nft => nft.isGenerated === isGenerated)
    }

    if (isSent !== null) {
      filteredNFTs = filteredNFTs.filter(nft => nft.isSent === isSent)
    }

    const validatedNFTs = NFTsArraySchema.parse(filteredNFTs)

    return NextResponse.json({
      nfts: validatedNFTs,
      total: validatedNFTs.length,
    })
  } catch (error) {
    console.error('Error fetching NFTs:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid NFT data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to fetch NFTs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, owner, image, isGenerated, signature, message } = body

    // Verify the signature
    const isValid = await verifySignature(owner, signature, message)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const newNFT = NFTSchema.parse({
      id: nfts.length + 1,
      name,
      owner,
      image,
      isGenerated,
      isSent: false,
    })

    // Mint the NFT on Solana
    const mintResult = await mintNFT(newNFT)
    if (!mintResult.success) {
      return NextResponse.json({ error: 'Failed to mint NFT' }, { status: 500 })
    }

    nfts.push(newNFT)

    return NextResponse.json({ nft: newNFT, mintAddress: mintResult.mintAddress }, { status: 201 })
  } catch (error) {
    console.error('Error creating NFT:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid NFT data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create NFT' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const action = searchParams.get('action')

    if (!id || !action) {
      return NextResponse.json({ error: 'NFT ID and action are required' }, { status: 400 })
    }

    const body = await request.json()
    const { from, to, signature, message } = body

    // Verify the signature
    const isValid = await verifySignature(from, signature, message)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const nftIndex = nfts.findIndex(nft => nft.id === parseInt(id, 10))

    if (nftIndex === -1) {
      return NextResponse.json({ error: 'NFT not found' }, { status: 404 })
    }

    if (action === 'transfer') {
      if (!to) {
        return NextResponse.json({ error: 'Recipient address is required for transfer' }, { status: 400 })
      }

      // Transfer the NFT on Solana
      const transferResult = await transferNFT(nfts[nftIndex], from, to)
      if (!transferResult.success) {
        return NextResponse.json({ error: 'Failed to transfer NFT' }, { status: 500 })
      }

      nfts[nftIndex].owner = to
      nfts[nftIndex].isSent = true
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json(nfts[nftIndex])
  } catch (error) {
    console.error('Error updating NFT:', error)
    return NextResponse.json({ error: 'Failed to update NFT' }, { status: 500 })
  }
}

async function verifySignature(walletAddress: string, signature: string, message: string): Promise<boolean> {
  try {
    const publicKey = new PublicKey(walletAddress)
    const signatureUint8 = bs58.decode(signature)
    const messageUint8 = new TextEncoder().encode(message)

    return sign.detached.verify(messageUint8, signatureUint8, publicKey.toBytes())
  } catch (error) {
    console.error('Error verifying signature:', error)
    return false
  }
}

async function mintNFT(nft: z.infer<typeof NFTSchema>): Promise<{ success: boolean; mintAddress?: string }> {
  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL!, 'confirmed')
    const payer = new PublicKey(process.env.PAYER_WALLET!)
    const owner = new PublicKey(nft.owner)

    // Create a new mint
    const mint = await createMint(connection, payer, owner, null, 0)

    // Get the token account of the owner address
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      owner
    )

    // Mint 1 token to the owner
    await mintTo(
      connection,
      payer,
      mint,
      tokenAccount.address,
      payer,
      1
    )

    return { success: true, mintAddress: mint.toBase58() }
  } catch (error) {
    console.error('Error minting NFT:', error)
    return { success: false }
  }
}

async function transferNFT(nft: z.infer<typeof NFTSchema>, from: string, to: string): Promise<{ success: boolean }> {
  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL!, 'confirmed')
    const fromPublicKey = new PublicKey(from)
    const toPublicKey = new PublicKey(to)
    const mintPublicKey = new PublicKey(nft.id.toString()) // Assuming the NFT ID is the mint address

    // Get the token accounts of the from and to addresses
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromPublicKey,
      mintPublicKey,
      fromPublicKey
    )

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromPublicKey,
      mintPublicKey,
      toPublicKey
    )

    // Transfer the NFT
    await transfer(
      connection,
      fromPublicKey,
      fromTokenAccount.address,
      toTokenAccount.address,
      fromPublicKey,
      1
    )

    return { success: true }
  } catch (error) {
    console.error('Error transferring NFT:', error)
    return { success: false }
  }
}