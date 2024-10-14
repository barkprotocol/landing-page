import { NextApiRequest, NextApiResponse } from 'next';
import { createNFT } from './nft-mint';
import { logError } from '../../../errors/error-logger';

// Function to handle API requests for NFTs
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { name, description, image } = req.body;

      // Validate request body
      if (!name || !description || !image) {
        return res.status(400).json({ message: 'All fields are required.' });
      }

      // Call the service to create the NFT
      const newNFT = await createNFT(name, description, image);
      return res.status(201).json(newNFT);
    } catch (error) {
      // Log the error
      logError(error);
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  } else {
    // Handle other HTTP methods if needed
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
