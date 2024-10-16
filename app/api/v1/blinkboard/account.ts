import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Connection, PublicKey } from '@solana/web3.js'
import { sign } from 'tweetnacl'
import bs58 from 'bs58'
import { getAssociatedTokenAddress } from '@solana/spl-token'

// Mock database for accounts
let accounts = [
  { id: 1, walletAddress: 'Gq7GW...', username: 'alice', email: 'alice@example.com', avatar: 'https://example.com/avatar1.png', createdAt: '2024-10-16T10:30:00Z' },
  { id: 2, walletAddress: 'Hx9Kp...', username: 'bob', email: 'bob@example.com', avatar: 'https://example.com/avatar2.png', createdAt: '2024-10-16T11:15:00Z' },
  { id: 3, walletAddress: 'Jm2Rt...', username: 'charlie', email: 'charlie@example.com', avatar: 'https://example.com/avatar3.png', createdAt: '2024-10-16T12:00:00Z' },
]

const AccountSchema = z.object({
  id: z.number(),
  walletAddress: z.string().length(44),
  username: z.string().min(3).max(20),
  email: z.string().email(),
  avatar: z.string().url().optional(),
  createdAt: z.string().datetime(),
})

const MILTON_TOKEN_MINT = new PublicKey('4DsZctdxSVNLGYB5YtY8A8JDg6tUoSZnQHSamXecKWWf')

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')

    if (walletAddress) {
      const account = accounts.find(a => a.walletAddress === walletAddress)
      if (!account) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 })
      }
      const validatedAccount = AccountSchema.parse(account)
      const balance = await getAccountBalance(walletAddress)
      return NextResponse.json({ ...validatedAccount, balance })
    }

    const validatedAccounts = z.array(AccountSchema).parse(accounts)
    return NextResponse.json({ accounts: validatedAccounts, total: accounts.length })
  } catch (error) {
    console.error('Error fetching account(s):', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid account data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to fetch account(s)' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { walletAddress, signature, message, username, email, avatar } = body

    // Verify the signature
    const isValid = await verifySignature(walletAddress, signature, message)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Check if account already exists
    if (accounts.some(a => a.walletAddress === walletAddress)) {
      return NextResponse.json({ error: 'Account already exists' }, { status: 409 })
    }

    const newAccount = AccountSchema.parse({
      id: accounts.length + 1,
      walletAddress,
      username,
      email,
      avatar,
      createdAt: new Date().toISOString(),
    })

    accounts.push(newAccount)
    return NextResponse.json(newAccount, { status: 201 })
  } catch (error) {
    console.error('Error creating account:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid account data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }

    const body = await request.json()
    const { signature, message, username, email, avatar } = body

    // Verify the signature
    const isValid = await verifySignature(walletAddress, signature, message)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const accountIndex = accounts.findIndex(account => account.walletAddress === walletAddress)

    if (accountIndex === -1) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const updatedAccount = AccountSchema.parse({
      ...accounts[accountIndex],
      username,
      email,
      avatar,
    })

    accounts[accountIndex] = updatedAccount

    return NextResponse.json(updatedAccount)
  } catch (error) {
    console.error('Error updating account:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid account data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')
    const signature = searchParams.get('signature')
    const message = searchParams.get('message')

    if (!walletAddress || !signature || !message) {
      return NextResponse.json({ error: 'Wallet address, signature, and message are required' }, { status: 400 })
    }

    // Verify the signature
    const isValid = await verifySignature(walletAddress, signature, message)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const accountIndex = accounts.findIndex(account => account.walletAddress === walletAddress)

    if (accountIndex === -1) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    accounts.splice(accountIndex, 1)

    return NextResponse.json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
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

async function getAccountBalance(walletAddress: string): Promise<number> {
  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL!, 'confirmed')
    const publicKey = new PublicKey(walletAddress)
    const tokenAccount = await getAssociatedTokenAddress(MILTON_TOKEN_MINT, publicKey)
    const balance = await connection.getTokenAccountBalance(tokenAccount)
    return parseFloat(balance.value.amount) / 1e9 // Assuming 9 decimals for MILTON token
  } catch (error) {
    console.error('Error fetching account balance:', error)
    return 0
  }
}