import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token'

// Mock data for donations
let donations = [
  { id: 1, donor: 'Gq7GW...',  amount: 100, token: 'SOL', timestamp: '2024-10-16T10:30:00Z', message: 'Supporting the Milton ecosystem!' },
  { id: 2, donor: 'Hx9Kp...',  amount: 500, token: 'USDC', timestamp: '2024-10-16T11:15:00Z', message: 'Great work, team!' },
  { id: 3, donor: 'Jm2Rt...',  amount: 1000, token: 'MILTON', timestamp: '2024-10-16T12:00:00Z', message: 'Excited for the future of Milton!' },
]

const DonationSchema = z.object({
  id: z.number(),
  donor: z.string().min(5).max(44),
  amount: z.number().positive(),
  token: z.enum(['SOL', 'USDC', 'MILTON']),
  timestamp: z.string().datetime(),
  message: z.string().max(280).optional(),
})

const DonationsArraySchema = z.array(DonationSchema)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0

    let filteredDonations = [...donations]

    if (limit) {
      filteredDonations = filteredDonations.slice(offset, offset + limit)
    } else {
      filteredDonations = filteredDonations.slice(offset)
    }

    const validatedDonations = DonationsArraySchema.parse(filteredDonations)

    return NextResponse.json({
      donations: validatedDonations,
      total: donations.length,
      offset,
      limit: limit || donations.length - offset,
    })
  } catch (error) {
    console.error('Error fetching donations:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid donations data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newDonation = DonationSchema.parse({
      id: donations.length + 1,
      donor: body.donor,
      amount: body.amount,
      token: body.token,
      timestamp: new Date().toISOString(),
      message: body.message,
    })

    // In a real-world scenario, you would process the donation on-chain here
    // For demonstration purposes, we'll simulate the donation process
    const success = await processDonation(newDonation)

    if (success) {
      donations.unshift(newDonation)
      return NextResponse.json(newDonation, { status: 201 })
    } else {
      return NextResponse.json({ error: 'Failed to process donation' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error creating donation:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid donation data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create donation' }, { status: 500 })
  }
}

async function processDonation(donation: z.infer<typeof DonationSchema>): Promise<boolean> {
  // This is a placeholder function to simulate donation processing
  // In a real-world scenario, you would interact with the Solana blockchain here

  const connection = new Connection(process.env.SOLANA_RPC_URL!, 'confirmed')
  const donorPublicKey = new PublicKey(donation.donor)
  const recipientPublicKey = new PublicKey(process.env.DONATION_RECIPIENT_ADDRESS!)

  try {
    let transaction = new Transaction()

    if (donation.token === 'SOL') {
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: donorPublicKey,
          toPubkey: recipientPublicKey,
          lamports: donation.amount * 1e9, // Convert SOL to lamports
        })
      )
    } else {
      const tokenMintAddress = donation.token === 'USDC' 
        ? new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') // USDC mint address
        : new PublicKey('4DsZctdxSVNLGYB5YtY8A8JDg6tUoSZnQHSamXecKWWf') // MILTON mint address

      const fromTokenAccount = await getAssociatedTokenAddress(tokenMintAddress, donorPublicKey)
      const toTokenAccount = await getAssociatedTokenAddress(tokenMintAddress, recipientPublicKey)

      transaction.add(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          donorPublicKey,
          donation.amount * (donation.token === 'USDC' ? 1e6 : 1e9) // USDC has 6 decimals, MILTON has 9
        )
      )
    }

    // In a real scenario, you would send this transaction to be signed by the donor's wallet
    // and then submit it to the network. Here we're just simulating the process.
    console.log('Simulated transaction:', transaction)

    return true
  } catch (error) {
    console.error('Error processing donation:', error)
    return false
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Donation ID is required' }, { status: 400 })
    }

    const donationIndex = donations.findIndex(donation => donation.id === parseInt(id, 10))

    if (donationIndex === -1) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 })
    }

    donations.splice(donationIndex, 1)

    return NextResponse.json({ message: 'Donation deleted successfully' })
  } catch (error) {
    console.error('Error deleting donation:', error)
    return NextResponse.json({ error: 'Failed to delete donation' }, { status: 500 })
  }
}