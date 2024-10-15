import { NextResponse } from 'next/server';
import { sendTransaction } from '../../../lib/solana'; 
import { validateDonation } from '../../../lib/validators'; 

// Handle POST requests for donations
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate donation data
    const { error } = validateDonation(body);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Send transaction
    const transactionResult = await sendTransaction(body);

    // Return success response
    return NextResponse.json({ message: "Donation successful!", transactionResult }, { status: 200 });
  } catch (error) {
    console.error('Error processing donation:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
