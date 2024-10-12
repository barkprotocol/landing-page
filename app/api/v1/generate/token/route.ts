import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Generate token logic here
  const token = Math.random().toString(36).substr(2)
  return NextResponse.json({ token })
}

export async function POST(request: Request) {
  // Handle token generation with POST data
  const body = await request.json()
  // Process the body and generate token
  const token = Math.random().toString(36).substr(2)
  return NextResponse.json({ token, ...body })
}