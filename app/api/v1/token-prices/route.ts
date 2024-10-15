import { NextResponse } from 'next/server'

// This is a mock implementation. In a real-world scenario, you'd fetch prices from an actual API.
const mockPrices = {
  MILTON: 0.1,
  BARK: 0.05,
  SOL: 20,
  USDC: 1,
}

export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return NextResponse.json(mockPrices)
  } catch (error) {
    console.error('Error fetching token prices:', error)
    return NextResponse.json({ error: 'Failed to fetch token prices' }, { status: 500 })
  }
}