import { NextResponse } from 'next/server'
import { z } from 'zod'

// Mock data for generated blinks
let generatedBlinks = [
  { id: 1, content: 'Milton-generated: Milton Protocol reaches new milestone!', timestamp: '2024-10-16T10:30:00Z', aiModel: 'GPT-4' },
  { id: 2, content: 'Milton-generated: Solana ecosystem expands with innovative DeFi solutions', timestamp: '2024-10-16T11:15:00Z', aiModel: 'GPT-4' },
  { id: 3, content: 'Milton-generated: Milton token integration boosts cross-chain liquidity', timestamp: '2024-10-16T12:00:00Z', aiModel: 'GPT-4' },
]

const GeneratedBlinkSchema = z.object({
  id: z.number(),
  content: z.string().min(1).max(280),
  timestamp: z.string().datetime(),
  aiModel: z.string(),
})

const GeneratedBlinksArraySchema = z.array(GeneratedBlinkSchema)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0

    let filteredBlinks = [...generatedBlinks]

    if (limit) {
      filteredBlinks = filteredBlinks.slice(offset, offset + limit)
    } else {
      filteredBlinks = filteredBlinks.slice(offset)
    }

    const validatedBlinks = GeneratedBlinksArraySchema.parse(filteredBlinks)

    return NextResponse.json({
      generatedBlinks: validatedBlinks,
      total: generatedBlinks.length,
      offset,
      limit: limit || generatedBlinks.length - offset,
    })
  } catch (error) {
    console.error('Error fetching generated blinks:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid generated blinks data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to fetch generated blinks' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newBlink = GeneratedBlinkSchema.parse({
      id: generatedBlinks.length + 1,
      content: body.content,
      timestamp: new Date().toISOString(),
      aiModel: body.aiModel || 'GPT-4', // Default to GPT-4 if not provided
    })

    generatedBlinks.unshift(newBlink)

    return NextResponse.json(newBlink, { status: 201 })
  } catch (error) {
    console.error('Error creating generated blink:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid generated blink data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create generated blink' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Generated Blink ID is required' }, { status: 400 })
    }

    const blinkIndex = generatedBlinks.findIndex(blink => blink.id === parseInt(id, 10))

    if (blinkIndex === -1) {
      return NextResponse.json({ error: 'Generated Blink not found' }, { status: 404 })
    }

    generatedBlinks.splice(blinkIndex, 1)

    return NextResponse.json({ message: 'Generated Blink deleted successfully' })
  } catch (error) {
    console.error('Error deleting generated blink:', error)
    return NextResponse.json({ error: 'Failed to delete generated blink' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Generated Blink ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const updatedBlink = GeneratedBlinkSchema.parse({
      ...body,
      id: parseInt(id, 10),
    })

    const blinkIndex = generatedBlinks.findIndex(blink => blink.id === updatedBlink.id)

    if (blinkIndex === -1) {
      return NextResponse.json({ error: 'Generated Blink not found' }, { status: 404 })
    }

    generatedBlinks[blinkIndex] = updatedBlink

    return NextResponse.json(updatedBlink)
  } catch (error) {
    console.error('Error updating generated blink:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid generated blink data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update generated blink' }, { status: 500 })
  }
}