import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { sign } from 'tweetnacl'
import bs58 from 'bs58'
import { getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token'

// Mock data for blinks
let blinks = [
  { id: 1, content: 'About Milton Protocol!', timestamp: '2024-10-16T10:30:00Z', author: 'Gq7GW...', likes: 5, isGenerated: false },
  { id: 2, content: 'New DeFi protocol launches on Solana', timestamp: '2024-10-16T11:15:00Z', author: 'Hx9Kp...', likes: 3, isGenerated: false },
  { id: 3, content: 'AI-generated: Milton token reaches new all-time high', timestamp: '2024-10-16T12:00:00Z', author: 'AI', likes: 8, isGenerated: true },
]

const BlinkSchema = z.object({
  id: z.number(),
  content: z.string().max(280),
  timestamp: z.string().datetime(),
  author: z.string(),
  likes: z.number().nonnegative(),
  isGenerated: z.boolean(),
})

const BlinksArraySchema = z.array(BlinkSchema)

const MILTON_TOKEN_MINT = new PublicKey('4DsZctdxSVNLGYB5YtY8A8JDg6tUoSZnQHSamXecKWWf')
const BLINK_COST = 0.1 // Cost in MILTON tokens to create a blink

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0
    const onlyGenerated = searchParams.get('generated') === 'true'

    let filteredBlinks = [...blinks]

    if (onlyGenerated) {
      filteredBlinks = filteredBlinks.filter(blink => blink.isGenerated)
    }

    if (limit) {
      filteredBlinks = filteredBlinks.slice(offset, offset + limit)
    } else {
      filteredBlinks = filteredBlinks.slice(offset)
    }

    const validatedBlinks = BlinksArraySchema.parse(filteredBlinks)

    return NextResponse.json({
      blinks: validatedBlinks,
      total: blinks.length,
      offset,
      limit: limit || blinks.length - offset,
    })
  } catch (error) {
    console.error('Error fetching blinks:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid blinks data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to fetch blinks' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { content, author, signature, message } = body

    // Verify the signature
    const isValid = await verifySignature(author, signature, message)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Check if the user has enough MILTON tokens to create a blink
    const hasEnoughTokens = await checkUserBalance(author)
    if (!hasEnoughTokens) {
      return NextResponse.json({ error: 'Insufficient MILTON tokens to create a blink' }, { status: 403 })
    }

    const newBlink = BlinkSchema.parse({
      id: blinks.length + 1,
      content,
      timestamp: new Date().toISOString(),
      author,
      likes: 0,
      isGenerated: false,
    })

    blinks.unshift(newBlink)

    // Deduct MILTON tokens for creating a blink
    await deductTokens(author)

    return NextResponse.json(newBlink, { status: 201 })
  } catch (error) {
    console.error('Error creating blink:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid blink data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create blink' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const action = searchParams.get('action')

    if (!id || !action) {
      return NextResponse.json({ error: 'Blink ID and action are required' }, { status: 400 })
    }

    const body = await request.json()
    const { author, signature, message } = body

    // Verify the signature
    const isValid = await verifySignature(author, signature, message)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const blinkIndex = blinks.findIndex(blink => blink.id === parseInt(id, 10))

    if (blinkIndex === -1) {
      return NextResponse.json({ error: 'Blink not found' }, { status: 404 })
    }

    if (action === 'like') {
      blinks[blinkIndex].likes += 1
    } else if (action === 'unlike') {
      blinks[blinkIndex].likes = Math.max(0, blinks[blinkIndex].likes - 1)
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json(blinks[blinkIndex])
  } catch (error) {
    console.error('Error updating blink:', error)
    return NextResponse.json({ error: 'Failed to update blink' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const author = searchParams.get('author')
    const signature = searchParams.get('signature')
    const message = searchParams.get('message')

    if (!id || !author || !signature || !message) {
      return NextResponse.json({ error: 'Blink ID, author, signature, and message are required' }, { status: 400 })
    }

    // Verify the signature
    const isValid = await verifySignature(author, signature, message)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const blinkIndex = blinks.findIndex(blink => blink.id === parseInt(id, 10) && blink.author === author)

    if (blinkIndex === -1) {
      return NextResponse.json({ error: 'Blink not found or you are not the author' }, { status: 404 })
    }

    blinks.splice(blinkIndex, 1)

    return NextResponse.json({ message: 'Blink deleted successfully' })
  } catch (error) {
    console.error('Error deleting blink:', error)
    return NextResponse.json({ error: 'Failed to delete blink' }, { status: 500 })
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

async function checkUserBalance(walletAddress: string): Promise<boolean> {
  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL!, 'confirmed')
    const publicKey = new PublicKey(walletAddress)
    const tokenAccount = await getAssociatedTokenAddress(MILTON_TOKEN_MINT, publicKey)
    const balance = await connection.getTokenAccountBalance(tokenAccount)
    return parseFloat(balance.value.amount) / 1e9 >= BLINK_COST
  } catch (error) {
    console.error('Error checking user balance:', error)
    return false
  }
}

async function deductTokens(walletAddress: string): Promise<boolean> {
  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL!, 'confirmed')
    const publicKey = new PublicKey(walletAddress)
    const tokenAccount = await getAssociatedTokenAddress(MILTON_TOKEN_MINT, publicKey)
    const destinationAccount = await getAssociatedTokenAddress(MILTON_TOKEN_MINT, new PublicKey(process.env.TREASURY_WALLET!))

    const transaction = new Transaction().add(
      createTransferInstruction(
        tokenAccount,
        destinationAccount,
        publicKey,
        BigInt(BLINK_COST * 1e9) // Convert to raw token amount
      )
    )

    // In a real-world scenario, you would send this transaction to be signed by the user's wallet
    // and then submit it to the network. Here we're just simulating the process.
    console.log('Simulated transaction:', transaction)

    return true
  } catch (error) {
    console.error('Error deducting tokens:', error)
    return false
  }
}