import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { db } from '@/lib/db/drizzle';
import { users, referrals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Define a type for the referral response
interface Referral {
  id: string;
  email: string;
  date: string;
  status: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    // Fetch referrals for the authenticated user
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
    });

    // Format the referral data for the response
    const formattedReferrals: Referral[] = userReferrals.map(referral => ({
      id: referral.id,
      email: referral.referred.email,
      date: referral.createdAt.toISOString(),
      status: referral.status,
    }));

    // Respond with the formatted referrals
    res.status(200).json(formattedReferrals);
  } catch (error) {
    console.error('Error fetching referrals:', error);
    // Return a generic error response
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
