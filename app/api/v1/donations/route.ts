import { NextResponse } from 'next/server';
import { sendTransaction } from '@/lib/solana/solana';
import { validateDonation } from '@/lib/validators';

// Define the structure of the donation request body
interface DonationRequestBody {
  amount: number; // Example field, adjust according to your donation structure
  recipient: string; // Example field, adjust according to your donation structure
}

// Define the structure of the response
interface DonationResponse {
  message: string;
  transactionResult?: any; // Specify the type based on the transaction result
}

// Handle POST requests for donations
export async function POST(request: Request) {
  try {
    const body: DonationRequestBody = await request.json();

    // Validate donation data
    const { error } = validateDonation(body);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Send transaction
    const transactionResult = await sendTransaction(body);

    // Return success response
    const response: DonationResponse = {
      message: "Donation successful!",
      transactionResult,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error processing donation:', error);
    
    // Check if the error is a known type (e.g., transaction error) and return a specific message if applicable
    if (error instanceof SomeSpecificErrorType) {
      return NextResponse.json({ error: "Specific error message." }, { status: 400 });
    }

    // Return a generic error response for unhandled errors
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
