import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { db } from '@/lib/db/drizzle';
import { users, referrals, transactions } from '@/lib/db/schema';
import { eq, and, sum } from 'drizzle-orm';

// Define an interface for the response type
interface AffiliateStatsResponse {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<AffiliateStatsResponse | { message: string }>) {
  // Allow only GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Get the session to identify the user
    const session = await getServerSession(req, res, authOptions);

    // Check for a valid session
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Fetch referral stats and earnings stats concurrently
    const [referralStats, earningsStats] = await Promise.all([
      db.query.referrals.findMany({
        where: eq(referrals.referrerId, session.user.id),
        columns: {
          status: true,
        },
      }),
      db.select({
        totalEarnings: sum(transactions.amount),
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, session.user.id),
          eq(transactions.type, 'referral_reward')
        )
      ),
    ]);

    // Calculate totals
    const totalReferrals = referralStats.length;
    const activeReferrals = referralStats.filter(r => r.status === 'active').length;
    const totalEarnings = earningsStats[0]?.totalEarnings || 0;
    const pendingEarnings = totalReferrals * 10 - totalEarnings; // Assuming $10 per referral

    // Respond with the affiliate stats
    res.status(200).json({
      totalReferrals,
      activeReferrals,
      totalEarnings,
      pendingEarnings,
    });
  } catch (error) {
    console.error('Error fetching affiliate stats:', error);
    // Return a generic error response
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
