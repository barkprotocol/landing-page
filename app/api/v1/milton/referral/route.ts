import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'
import { CustomError, ErrorType } from '@/lib/custom-error'
import { Logger } from '@/lib/logger'
import jwt from 'jsonwebtoken'
import { createHmac } from 'crypto'
import prisma from '@/lib/prisma'
import { createReferral, completeReferral, getUserReferrals, getUserById, updateWalletBalance } from '@/lib/db/queries
const logger = new Logger('api/v1/milton/referral')

// Schema for validating referral inputs
const referralSchema = z.object({
  referredEmail: z.string().email(),
})

// Function to verify JWT token
async function verifyJWT(token: string): Promise<boolean> {
  try {
    jwt.verify(token, process.env.JWT_SECRET!)
    return true
  } catch {
    return false
  }
}

// Function to verify the request signature for security
async function verifySignature(request: NextRequest): Promise<boolean> {
  const signature = request.headers.get('x-signature')
  const timestamp = request.headers.get('x-timestamp')
  const body = await request.text()

  if (!signature || !timestamp) return false

  const hmac = createHmac('sha256', process.env.API_SECRET!)
  hmac.update(`${timestamp}.${body}`)
  const expectedSignature = hmac.digest('hex')

  return signature === expectedSignature
}

// POST handler for creating a referral
export async function POST(request: NextRequest) {
  try {
    const { success } = await rateLimit(request)
    if (!success) throw new CustomError(ErrorType.RateLimitExceeded, 'Rate limit exceeded')

    const authToken = request.headers.get('authorization')?.split(' ')[1]
    if (!authToken || !(await verifyJWT(authToken))) throw new CustomError(ErrorType.Unauthorized, 'Unauthorized')

    if (!(await verifySignature(request))) throw new CustomError(ErrorType.InvalidSignature, 'Invalid signature')

    const body = await request.json()
    const { referredEmail } = referralSchema.parse(body)

    // Get referrer info from JWT
    const decodedToken = jwt.decode(authToken) as { userId: number }
    const referrer = await getUserById(decodedToken.userId)
    if (!referrer) throw new CustomError(ErrorType.UserNotFound, 'User not found')

    // Check if referred user exists
    const referredUser = await prisma.users.findUnique({ where: { email: referredEmail } })
    if (!referredUser) throw new CustomError(ErrorType.UserNotFound, 'Referred user not found')

    // Check for existing referral
    const existingReferral = await prisma.referrals.findFirst({
      where: { referrerId: referrer.id, referredId: referredUser.id },
    })
    if (existingReferral) throw new CustomError(ErrorType.ReferralExists, 'Referral already exists')

    // Create new referral
    const referral = await createReferral(referrer.id, referredUser.id)
    return NextResponse.json({ success: true, referral })

  } catch (error) {
    logger.error('Error processing referral:', error)
    return handleError(error)
  }
}

// GET handler for fetching user referrals
export async function GET(request: NextRequest) {
  try {
    const { success } = await rateLimit(request)
    if (!success) throw new CustomError(ErrorType.RateLimitExceeded, 'Rate limit exceeded')

    const authToken = request.headers.get('authorization')?.split(' ')[1]
    if (!authToken || !(await verifyJWT(authToken))) throw new CustomError(ErrorType.Unauthorized, 'Unauthorized')

    // Get user info from JWT
    const decodedToken = jwt.decode(authToken) as { userId: number }
    const user = await getUserById(decodedToken.userId)
    if (!user) throw new CustomError(ErrorType.UserNotFound, 'User not found')

    // Get user referrals
    const referrals = await getUserReferrals(user.id)
    return NextResponse.json({ success: true, referrals })

  } catch (error) {
    logger.error('Error fetching referrals:', error)
    return handleError(error)
  }
}

// PUT handler for completing a referral and rewarding the user
export async function PUT(request: NextRequest) {
  try {
    const { success } = await rateLimit(request)
    if (!success) throw new CustomError(ErrorType.RateLimitExceeded, 'Rate limit exceeded')

    const authToken = request.headers.get('authorization')?.split(' ')[1]
    if (!authToken || !(await verifyJWT(authToken))) throw new CustomError(ErrorType.Unauthorized, 'Unauthorized')

    if (!(await verifySignature(request))) throw new CustomError(ErrorType.InvalidSignature, 'Invalid signature')

    const body = await request.json()
    const { referralId } = body

    // Get user info from JWT
    const decodedToken = jwt.decode(authToken) as { userId: number }
    const user = await getUserById(decodedToken.userId)
    if (!user) throw new CustomError(ErrorType.UserNotFound, 'User not found')

    // Ensure the user is an admin
    if (user.role !== 'admin') throw new CustomError(ErrorType.Unauthorized, 'Unauthorized')

    // Complete the referral and give a reward
    const reward = '10' // 10 MILTON tokens as reward
    await completeReferral(referralId, reward)

    // Update the referrer's wallet balance
    const referral = await prisma.referrals.findUnique({ where: { id: referralId } })
    if (referral) await updateWalletBalance(referral.referrerId, 'MILTON', reward)

    return NextResponse.json({ success: true, message: 'Referral completed and reward given' })

  } catch (error) {
    logger.error('Error completing referral:', error)
    return handleError(error)
  }
}

// Helper function to handle errors
function handleError(error: any) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
  }
  if (error instanceof CustomError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode })
  }
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
