import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Handle GET requests
  try {
    // Your GET logic here
    return NextResponse.json({ message: 'GET request successful' })
  } catch (error) {
    console.error('Error in GET request:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Handle POST requests
  try {
    const body = await request.json()
    // Your POST logic here
    return NextResponse.json({ message: 'POST request successful', data: body })
  } catch (error) {
    console.error('Error in POST request:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}