import type { NextApiRequest, NextApiResponse } from 'next';
import { createUser } from '@/lib/user-controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'POST') {
    try {
      const user = await createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
