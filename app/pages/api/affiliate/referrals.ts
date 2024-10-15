import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { db } from '@/lib/db/drizzle'
import { users, referrals } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session || !session.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const userReferrals = await db.query.referrals.findMany({
      where: eq(referrals.referrerId, session.user.id),
      with: {
        referred: {
          columns: {
            email: true,
          },
        },
      },
      columns: {
        id: true,
        createdAt: true,
        status: true,
      },
    })

    const formattedReferrals = userReferrals.map(referral => ({
      id: referral.id,
      email: referral.referred.email,
      date: referral.createdAt.toISOString(),
      status: referral.status,
    }))

    res.status(200).json(formattedReferrals)
  } catch (error) {
    console.error('Error fetching referrals:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}