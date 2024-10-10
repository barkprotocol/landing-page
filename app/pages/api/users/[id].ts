import type { NextApiRequest, NextApiResponse } from 'next';
import { getUser, updateUser, deleteUser } from '@/lib/user-controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { id } = req.query;

  switch (method) {
    case 'GET':
      try {
        const user = await getUser(id as string);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
      } catch (error) {
        res.status(500).json({ message: 'Server error' });
      }
      break;
    case 'PUT':
      try {
        const updatedUser = await updateUser(id as string, req.body);
        if (!updatedUser) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(updatedUser);
      } catch (error) {
        res.status(500).json({ message: 'Server error' });
      }
      break;
    case 'DELETE':
      try {
        const deletedUser = await deleteUser(id as string);
        if (!deletedUser) {
          return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted' });
      } catch (error) {
        res.status(500).json({ message: 'Server error' });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
