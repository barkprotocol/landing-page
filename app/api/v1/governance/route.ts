import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PublicKey } from '@solana/web3.js';
import { processGovernanceAction } from '@/lib/milton/governance/actions';

// Define a schema for validating incoming requests
const governanceActionSchema = z.object({
  actionType: z.enum(['vote', 'propose']),
  proposalId: z.string().min(1),
  publicKey: z.string().refine((key) => {
    try {
      new PublicKey(key); // Validate the public key
      return true;
    } catch {
      return false;
    }
  }),
  data: z.object({}), // You can customize this based on your action type
});

// Handle POST requests for governance actions
export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const requestBody = await request.json();
    const validatedData = governanceActionSchema.parse(requestBody);

    const { actionType, proposalId, publicKey, data } = validatedData;

    // Process the governance action
    const result = await processGovernanceAction(actionType, proposalId, publicKey, data);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: 'Validation error', errors: error.errors }, { status: 400 });
    }
    console.error('Error processing governance action:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
