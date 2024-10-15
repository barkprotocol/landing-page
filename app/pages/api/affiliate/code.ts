import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { db } from '@/lib/db/drizzle'
import { users } from '@/lib/db/schema'
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

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: {
        referralCode: true,
      },
    })

    if (!user || !user.referralCode) {
      return res.status(404).json({ message: 'Referral code not found' })
    }

    res.status(200).json({ code: user.referralCode })
  } catch (error) {
    console.error('Error fetching referral code:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}