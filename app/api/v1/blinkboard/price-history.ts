import { NextResponse } from 'next/server'
import { z } from 'zod'

// Mock data for price history
const priceHistory = [
  { date: '2024-10-01', SOL: 150.5, USDC: 1.0, MILTON: 0.00000012 },
  { date: '2024-09-01', SOL: 145.2, USDC: 1.0, MILTON: 0.00000011 },
  { date: '2024-08-01', SOL: 140.8, USDC: 1.0, MILTON: 0.00000010 },
  { date: '2024-07-01', SOL: 138.3, USDC: 1.0, MILTON: 0.00000009 },
  { date: '2024-06-01', SOL: 135.7, USDC: 1.0, MILTON: 0.00000008 },
  { date: '2024-05-01', SOL: 132.1, USDC: 1.0, MILTON: 0.00000007 },
  { date: '2024-04-01', SOL: 130.5, USDC: 1.0, MILTON: 0.00000006 },
  { date: '2024-03-01', SOL: 128.9, USDC: 1.0, MILTON: 0.00000005 },
  { date: '2024-02-01', SOL: 125.4, USDC: 1.0, MILTON: 0.00000004 },
  { date: '2024-01-01', SOL: 122.8, USDC: 1.0, MILTON: 0.00000003 },
]

const PriceHistorySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  SOL: z.number().positive(),
  USDC: z.number().positive(),
  MILTON: z.number().positive(),
})

const PriceHistoryArraySchema = z.array(PriceHistorySchema)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined

    let filteredHistory = [...priceHistory]

    if (start) {
      filteredHistory = filteredHistory.filter(entry => entry.date >= start)
    }

    if (end) {
      filteredHistory = filteredHistory.filter(entry => entry.date <= end)
    }

    if (limit) {
      filteredHistory = filteredHistory.slice(0, limit)
    }

    const validatedHistory = PriceHistoryArraySchema.parse(filteredHistory)

    return NextResponse.json({
      priceHistory: validatedHistory,
      total: validatedHistory.length,
    })
  } catch (error) {
    console.error('Error fetching price history:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid price history data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to fetch price history' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newEntry = PriceHistorySchema.parse(body)

    // Check if an entry for this date already exists
    const existingIndex = priceHistory.findIndex(entry => entry.date === newEntry.date)
    if (existingIndex !== -1) {
      // Update existing entry
      priceHistory[existingIndex] = newEntry
    } else {
      // Add new entry
      priceHistory.unshift(newEntry)
    }

    // Sort the array by date in descending order
    priceHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json(newEntry, { status: 201 })
  } catch (error) {
    console.error('Error adding price history entry:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid price history data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to add price history entry' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    const entryIndex = priceHistory.findIndex(entry => entry.date === date)

    if (entryIndex === -1) {
      return NextResponse.json({ error: 'Price history entry not found' }, { status: 404 })
    }

    priceHistory.splice(entryIndex, 1)

    return NextResponse.json({ message: 'Price history entry deleted successfully' })
  } catch (error) {
    console.error('Error deleting price history entry:', error)
    return NextResponse.json({ error: 'Failed to delete price history entry' }, { status: 500 })
  }
}