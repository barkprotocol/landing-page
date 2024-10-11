import { NextResponse } from 'next/server'
import { CustomError, ErrorType } from '@/lib/custom-error'
import { Logger } from '@/lib/logger'
import prisma from '@/lib/prisma'

const logger = new Logger('api/v1/blinks/blink-count')

export async function GET() {
  try {
    // Fetch the count of Blinks from the database
    const count = await prisma.blink.count()

    return NextResponse.json({ count })
  } catch (error) {
    logger.error('Error fetching Blink count:', error)
    if (error instanceof CustomError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching the Blink count' },
      { status: 500 }
    )
  }
}