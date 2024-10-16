import { NextRequest, NextResponse } from 'next/server'
import { Connection, Keypair, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, createTransferInstruction, getMint } from '@solana/spl-token'
import { z } from 'zod'

const SOLANA_RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'devnet' 
  ? 'https://api.devnet.solana.com' 
  : 'https://api.mainnet-beta.solana.com'
const MILTON_TOKEN_MINT = process.env.MILTON_TOKEN_MINT
const CROWDFUNDING_AUTHORITY_PRIVATE_KEY = process.env.CROWDFUNDING_AUTHORITY_PRIVATE_KEY

if (!MILTON_TOKEN_MINT || !CROWDFUNDING_AUTHORITY_PRIVATE_KEY) {
  throw new Error('Required environment variables are not set')
}

const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed')
const authorityKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(CROWDFUNDING_AUTHORITY_PRIVATE_KEY)))

const CreateCampaignSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000),
  goal: z.number().positive(),
  endDate: z.string().datetime(),
})

const ContributeSchema = z.object({
  campaignId: z.string(),
  contributorAddress: z.string(),
  amount: z.number().positive(),
})

// In-memory storage for campaigns (replace with a database in a real-world scenario)
const campaigns = new Map<string, {
  id: string;
  name: string;
  description: string;
  goal: number;
  raised: number;
  endDate: Date;
  creator: string;
}>()

export async function POST(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.endsWith('/create')) {
    return handleCreateCampaign(request)
  } else if (pathname.endsWith('/contribute')) {
    return handleContribute(request)
  } else {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 })
  }
}

async function handleCreateCampaign(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, goal, endDate } = CreateCampaignSchema.parse(body)

    const campaignId = Math.random().toString(36).substring(2, 15)
    campaigns.set(campaignId, {
      id: campaignId,
      name,
      description,
      goal,
      raised: 0,
      endDate: new Date(endDate),
      creator: authorityKeypair.publicKey.toBase58(),
    })

    return NextResponse.json({
      success: true,
      campaignId,
      message: `Campaign "${name}" created successfully`,
    })
  } catch (error) {
    console.error('Create campaign error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

async function handleContribute(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaignId, contributorAddress, amount } = ContributeSchema.parse(body)

    const campaign = campaigns.get(campaignId)
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (new Date() > campaign.endDate) {
      return NextResponse.json({ error: 'Campaign has ended' }, { status: 400 })
    }

    const miltonTokenMint = new PublicKey(MILTON_TOKEN_MINT)
    const contributorPublicKey = new PublicKey(contributorAddress)

    const mintInfo = await getMint(connection, miltonTokenMint)
    const contributionAmount = amount * Math.pow(10, mintInfo.decimals)

    const contributorATA = await getOrCreateAssociatedTokenAccount(
      connection,
      authorityKeypair,
      miltonTokenMint,
      contributorPublicKey
    )

    const campaignATA = await getOrCreateAssociatedTokenAccount(
      connection,
      authorityKeypair,
      miltonTokenMint,
      authorityKeypair.publicKey
    )

    const transferInstruction = createTransferInstruction(
      contributorATA.address,
      campaignATA.address,
      contributorPublicKey,
      contributionAmount
    )

    const transaction = new Transaction().add(transferInstruction)
    transaction.feePayer = contributorPublicKey
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash

    const serializedTransaction = transaction.serialize({ requireAllSignatures: false })
    const base64Transaction = serializedTransaction.toString('base64')

    campaign.raised += amount
    campaigns.set(campaignId, campaign)

    return NextResponse.json({
      success: true,
      transaction: base64Transaction,
      message: `Contribution of ${amount} MILTON tokens prepared for campaign "${campaign.name}"`,
    })
  } catch (error) {
    console.error('Contribute error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const campaignId = request.nextUrl.searchParams.get('campaignId')

  if (campaignId) {
    const campaign = campaigns.get(campaignId)
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }
    return NextResponse.json(campaign)
  } else {
    return NextResponse.json(Array.from(campaigns.values()))
  }
}