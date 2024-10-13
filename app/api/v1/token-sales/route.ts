import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { z } from 'zod'

const MILTON_MINT = new PublicKey('MILTONmint1111111111111111111111111111111')
const MILTON_DECIMALS = 9
const SALE_CONTRACT_ADDRESS = new PublicKey('SALEcontract11111111111111111111111111111')

interface SalePhase {
  id: string
  name: string
  price: number
  minPurchase: number
  maxPurchase: number
  totalSupply: number
  remainingSupply: number
  startDate: Date
  endDate: Date
}

const salePhases: SalePhase[] = [
  {
    id: 'pre-sale',
    name: 'Pre-Sale',
    price: 0.00001,
    minPurchase: 1000,
    maxPurchase: 100000,
    totalSupply: 1000000000,
    remainingSupply: 1000000000,
    startDate: new Date('2024-11-05T00:00:00Z'),
    endDate: new Date('2024-11-11T23:59:59Z'),
  },
  {
    id: 'public-sale',
    name: 'Public Sale',
    price: 0.000015,
    minPurchase: 100,
    maxPurchase: 1000000,
    totalSupply: 5000000000,
    remainingSupply: 5000000000,
    startDate: new Date('2024-11-12T00:00:00Z'),
    endDate: new Date('2024-11-18T23:59:59Z'),
  },
  {
    id: 'final-sale',
    name: 'Final Sale',
    price: 0.00002,
    minPurchase: 10,
    maxPurchase: 10000000,
    totalSupply: 12067600000,
    remainingSupply: 12067600000,
    startDate: new Date('2024-11-19T00:00:00Z'),
    endDate: new Date('2024-11-25T23:59:59Z'),
  },
]

const purchaseSchema = z.object({
  phaseId: z.string(),
  amount: z.number().positive(),
  walletAddress: z.string(),
})

function getActiveSalePhase(): SalePhase | null {
  const now = new Date()
  return salePhases.find(phase => now >= phase.startDate && now <= phase.endDate) || null
}

function updateRemainingSupply(phaseId: string, amount: number): void {
  const phase = salePhases.find(p => p.id === phaseId)
  if (phase) {
    phase.remainingSupply -= amount
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const phaseId = searchParams.get('phase')

    if (phaseId) {
      const phase = salePhases.find(p => p.id === phaseId)
      if (!phase) {
        return NextResponse.json({ error: 'Sale phase not found' }, { status: 404 })
      }
      return NextResponse.json(phase)
    }

    const activePhase = getActiveSalePhase()
    return NextResponse.json({
      salePhases,
      activePhase,
      totalRemaining: salePhases.reduce((sum, phase) => sum + phase.remainingSupply, 0),
    })
  } catch (error) {
    console.error('Error in GET /api/v1/token-sales:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = purchaseSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.issues }, { status: 400 })
    }

    const { phaseId, amount, walletAddress } = result.data

    const phase = salePhases.find(p => p.id === phaseId)
    if (!phase) {
      return NextResponse.json({ error: 'Invalid sale phase' }, { status: 400 })
    }

    const now = new Date()
    if (now < phase.startDate || now > phase.endDate) {
      return NextResponse.json({ error: 'Sale phase is not active' }, { status: 400 })
    }

    if (amount < phase.minPurchase || amount > phase.maxPurchase) {
      return NextResponse.json({ error: 'Invalid purchase amount' }, { status: 400 })
    }

    if (amount > phase.remainingSupply) {
      return NextResponse.json({ error: 'Insufficient remaining supply' }, { status: 400 })
    }

    const connection = new Connection('https://api.devnet.solana.com', 'confirmed')
    const transaction = new Transaction()

    const buyerPublicKey = new PublicKey(walletAddress)
    const buyerTokenAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      MILTON_MINT,
      buyerPublicKey
    )

    const buyerTokenAccountInfo = await connection.getAccountInfo(buyerTokenAccount)
    if (!buyerTokenAccountInfo) {
      transaction.add(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          MILTON_MINT,
          buyerTokenAccount,
          buyerPublicKey,
          buyerPublicKey
        )
      )
    }

    const tokenAmount = amount * Math.pow(10, MILTON_DECIMALS)
    transaction.add(
      Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        MILTON_MINT,
        buyerTokenAccount,
        SALE_CONTRACT_ADDRESS,
        [],
        tokenAmount
      )
    )

    const lamports = Math.floor(amount * phase.price * LAMPORTS_PER_SOL)
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: buyerPublicKey,
        toPubkey: SALE_CONTRACT_ADDRESS,
        lamports: lamports,
      })
    )

    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    })

    updateRemainingSupply(phaseId, amount)

    return NextResponse.json({
      transaction: serializedTransaction.toString('base64'),
      amount: amount,
      price: phase.price,
      totalCost: lamports / LAMPORTS_PER_SOL,
      remainingSupply: phase.remainingSupply,
    })
  } catch (error) {
    console.error('Error in POST /api/v1/token-sales:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const runtime = 'edge'