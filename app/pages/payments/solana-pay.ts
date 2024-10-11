import { Connection, PublicKey } from '@solana/web3.js';
import { PaymentRequest, encodePaymentURI as encodeSolanaPayURI } from '@solana/pay';

// Replace with your Solana network RPC URL
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;

const connection = new Connection(SOLANA_RPC_URL, "confirmed");

// Function to create a payment request
export const createPaymentRequest = async (recipient: PublicKey, amount: number): Promise<PaymentRequest> => {
  try {
    const paymentRequest: PaymentRequest = {
      recipient,
      amount,
      // Optional parameters can be added here
    };

    return paymentRequest;
  } catch (error) {
    console.error("Error creating payment request:", error);
    throw new Error("Failed to create payment request");
  }
};

// Function to encode payment URI
export const encodePaymentURI = (paymentRequest: PaymentRequest): string => {
  try {
    return encodeSolanaPayURI(paymentRequest);
  } catch (error) {
    console.error("Error encoding payment URI:", error);
    throw new Error("Failed to encode payment URI");
  }
};
