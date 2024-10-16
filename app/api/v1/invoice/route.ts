import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey } from '@solana/web3.js'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'

const SOLANA_RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'devnet' 
  ? 'https://api.devnet.solana.com' 
  : 'https://api.mainnet-beta.solana.com'
const MILTON_TOKEN_MINT = process.env.MILTON_TOKEN_MINT
const USDC_TOKEN_MINT = process.env.USDC_TOKEN_MINT
const AUTHORITY_PRIVATE_KEY = process.env.AUTHORITY_PRIVATE_KEY

if (!MILTON_TOKEN_MINT || !USDC_TOKEN_MINT || !AUTHORITY_PRIVATE_KEY) {
  throw new Error('Required environment variables are not set')
}

const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed')

const InvoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be a positive number'),
})

const CreateInvoiceSchema = z.object({
  recipient: z.string().refine((val) => {
    try {
      new PublicKey(val)
      return true
    } catch {
      return false
    }
  }, 'Invalid Solana address'),
  dueDate: z.string().min(1, 'Due date is required'),
  items: z.array(InvoiceItemSchema).min(1, 'At least one item is required'),
  notes: z.string().optional(),
  token: z.enum(['SOL', 'MILTON', 'USDC']),
})

const GetInvoiceSchema = z.object({
  invoiceId: z.string().uuid('Invalid invoice ID'),
})

// In-memory storage for invoices (replace with a database in a real-world scenario)
const invoices = new Map<string, z.infer<typeof CreateInvoiceSchema> & { id: string, status: 'pending' | 'paid' }>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const invoiceData = CreateInvoiceSchema.parse(body)

    const invoiceId = uuidv4()
    const invoice = {
      ...invoiceData,
      id: invoiceId,
      status: 'pending' as const,
    }

    invoices.set(invoiceId, invoice)

    return NextResponse.json({
      success: true,
      invoiceId,
      message: 'Invoice created successfully',
    })
  } catch (error) {
    console.error('Create invoice error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const invoiceId = request.nextUrl.searchParams.get('invoiceId')

  if (!invoiceId) {
    return NextResponse.json({ error: 'Missing invoiceId parameter' }, { status: 400 })
  }

  try {
    const { invoiceId: validatedInvoiceId } = GetInvoiceSchema.parse({ invoiceId })
    const invoice = invoices.get(validatedInvoiceId)

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Get invoice error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { invoiceId, status } = await request.json()
    
    if (!invoiceId || !status) {
      return NextResponse.json({ error: 'Missing invoiceId or status' }, { status: 400 })
    }

    const invoice = invoices.get(invoiceId)

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (status === 'paid') {
      // Here you would typically process the payment
      // For demonstration purposes, we'll just update the status
      invoice.status = 'paid'
      invoices.set(invoiceId, invoice)

      return NextResponse.json({
        success: true,
        message: 'Invoice marked as paid',
      })
    } else {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
  } catch (error) {
    console.error('Update invoice error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
