import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Define the structure of the session object
interface SessionUser {
  id: string;
  // Add other user properties as needed
}

interface Session {
  user: SessionUser;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow only GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions) as Session;

    // Check for a valid session
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Fetch user data from the database
    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: {
        referralCode: true,
      },
    });

    // Check if the user exists and has a referral code
    if (!currentUser || !currentUser.referralCode) {
      return res.status(404).json({ message: 'Referral code not found' });
    }

    // Return the referral code
    res.status(200).json({ code: currentUser.referralCode });
  } catch (error) {
    console.error('Error fetching referral code:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
