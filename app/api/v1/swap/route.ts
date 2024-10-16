// app/api/v1/swap/route.ts
import { NextResponse } from 'next/server';
import { BlockchainServices } from '@/lib/blockchain/services';
import { SolanaConfig } from '@/lib/solana/config';

// Define a type for the request body
interface SwapRequest {
  fromToken: string;
  toToken: string;
  amount: number;
  recipientAddress: string;
}

// Helper function to validate request body
const validateRequestBody = (body: SwapRequest) => {
  if (!body.fromToken || !body.toToken || !body.amount || !body.recipientAddress) {
    throw new Error('All fields are required.');
  }
};

// POST handler for swapping tokens
export async function POST(request: Request) {
  try {
    const body: SwapRequest = await request.json();
    validateRequestBody(body);

    const { fromToken, toToken, amount, recipientAddress } = body;
    const swapResult = await BlockchainServices.swapTokens(fromToken, toToken, amount, recipientAddress);

    return NextResponse.json({ success: true, data: swapResult });
  } catch (error) {
    console.error('Error in swap POST:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
