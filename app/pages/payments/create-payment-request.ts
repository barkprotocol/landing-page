import { NextApiRequest, NextApiResponse } from 'next';
import { Connection, PublicKey } from '@solana/web3.js';
import { PaymentRequest, encodePaymentURI } from '@solana/pay';

// Replace with your Solana network RPC URL
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
const connection = new Connection(SOLANA_RPC_URL);

// Function to handle payment requests
const createPaymentRequestHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { recipientAddress, amount } = req.body;

  // Validate request body
  if (!recipientAddress || !amount) {
    return res.status(400).json({ message: 'Recipient address and amount are required.' });
  }

  try {
    const recipient = new PublicKey(recipientAddress);
    const paymentRequest: PaymentRequest = {
      recipient,
      amount: parseFloat(amount),
      // Optional parameters can be added here if needed
    };

    // Encode the payment URI
    const paymentURI = encodePaymentURI(paymentRequest);

    return res.status(200).json({ paymentURI });
  } catch (error) {
    console.error('Error creating payment request:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export default createPaymentRequestHandler;
