import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { db } from '@/lib/db/drizzle'
import { users, referrals, transactions } from '@/lib/db/schema'
import { eq, and, sum } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)

    if (!session || !session.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const [referralStats, earningsStats] = await Promise.all([
      db.query.referrals.findMany({
        where: eq(referrals.referrerId, session.user.id),
        columns: {
          status: true,
        },
      }),
      db.select({
        totalEarnings: sum(transactions.amount),
      }).from(transactions)
        .where(
          and(
            eq(transactions.userId, session.user.id),
            eq(transactions.type, 'referral_reward')
          )
        ),
    ])

    const totalReferrals = referralStats.length
    const activeReferrals = referralStats.filter(r => r.status === 'active').length
    const totalEarnings = earningsStats[0]?.totalEarnings || 0
    const pendingEarnings = totalReferrals * 10 - totalEarnings // Assuming $10 per referral

    res.status(200).json({
      totalReferrals,
      activeReferrals,
      totalEarnings,
      pendingEarnings,
    })
  } catch (error) {
    console.error('Error fetching affiliate stats:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}