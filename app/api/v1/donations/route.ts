import { NextResponse } from 'next/server';
import { sendTransaction } from '../../../lib/solana'; 
import { validateDonation } from '../../../lib/validators'; 

// Handle POST requests for donations
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = validateDonation(body);
    if (!validationResult.isValid) {
      return NextResponse.json({ error: validationResult.errors }, { status: 400 });
    }

    const { amount, recipient, message, selectedToken } = body;

    // Call the sendTransaction function to process the donation
    const result = await sendTransaction({
      amount,
      recipient,
      memo: message,
      selectedToken,
      fee: 0.01, // Adjust fee as necessary
    });

    return NextResponse.json({ message: 'Donation processed successfully', ...result });
  } catch (error) {
    console.error('Error processing donation:', error);
    return NextResponse.json({ error: 'Failed to process donation' }, { status: 500 });
  }
}

// Function to handle donation validations
export function validateDonation(data: any) {
  const errors: string[] = [];
  const { amount, recipient } = data;

  if (!amount || isNaN(amount) || amount <= 0) {
    errors.push('Invalid amount. It must be a positive number.');
  }

  if (!recipient || !/^.+@.+\..+$/.test(recipient)) { // Simple email validation
    errors.push('Invalid recipient. It must be a valid email address.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
