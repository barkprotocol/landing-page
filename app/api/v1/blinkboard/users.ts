import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Connection, PublicKey } from '@solana/web3.js'
import { sign } from 'tweetnacl'
import bs58 from 'bs58'

// Mock database for users
let users = [
  { id: 1, walletAddress: 'Gq7GW...', username: 'alice', email: 'alice@example.com', createdAt: '2024-10-16T10:30:00Z' },
  { id: 2, walletAddress: 'Hx9Kp...', username: 'bob', email: 'bob@example.com', createdAt: '2024-10-16T11:15:00Z' },
  { id: 3, walletAddress: 'Jm2Rt...', username: 'charlie', email: 'charlie@example.com', createdAt: '2024-10-16T12:00:00Z' },
]

const UserSchema = z.object({
  id: z.number(),
  walletAddress: z.string().length(44),
  username: z.string().min(3).max(20),
  email: z.string().email(),
  createdAt: z.string().datetime(),
})

const UsersArraySchema = z.array(UserSchema)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')

    if (walletAddress) {
      const user = users.find(u => u.walletAddress === walletAddress)
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      return NextResponse.json(UserSchema.parse(user))
    }

    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0

    let filteredUsers = [...users]

    if (limit) {
      filteredUsers = filteredUsers.slice(offset, offset + limit)
    } else {
      filteredUsers = filteredUsers.slice(offset)
    }

    const validatedUsers = UsersArraySchema.parse(filteredUsers)

    return NextResponse.json({
      users: validatedUsers,
      total: users.length,
      offset,
      limit: limit || users.length - offset,
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid user data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { walletAddress, signature, message, username, email } = body

    // Verify the signature
    const isValid = await verifySignature(walletAddress, signature, message)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const newUser = UserSchema.parse({
      id: users.length + 1,
      walletAddress,
      username,
      email,
      createdAt: new Date().toISOString(),
    })

    users.push(newUser)
    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid user data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
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
    const { signature, message, username, email } = body

    // Verify the signature
    const isValid = await verifySignature(walletAddress, signature, message)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const userIndex = users.findIndex(user => user.walletAddress === walletAddress)

    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updatedUser = UserSchema.parse({
      ...users[userIndex],
      username,
      email,
    })

    users[userIndex] = updatedUser

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid user data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
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

    const userIndex = users.findIndex(user => user.walletAddress === walletAddress)

    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    users.splice(userIndex, 1)

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
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