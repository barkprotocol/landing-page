import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { encodeURL, createQR, CreateQROptions } from '@solana/pay';
import BigNumber from 'bignumber.js';

// Replace with your Solana network RPC URL
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;

// Ensure SOLANA_RPC_URL is defined
if (!SOLANA_RPC_URL) {
  throw new Error('Solana RPC URL is not defined. Please check your environment variables.');
}

const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

interface PaymentRequest {
  recipient: PublicKey;
  amount: BigNumber;
  reference: PublicKey;
  label?: string;
  message?: string;
  memo?: string;
}

// Function to create a payment request
export const createPaymentRequest = async (
  recipient: string,
  amount: number,
  label?: string,
  message?: string,
  memo?: string
): Promise<PaymentRequest> => {
  try {
    // Validate recipient address
    const recipientPublicKey = new PublicKey(recipient);

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Amount must be a number greater than zero.');
    }

    // Convert amount to lamports and then to BigNumber
    const amountInLamports = new BigNumber(amount).times(LAMPORTS_PER_SOL);

    // Generate a new reference public key
    const reference = PublicKey.unique();

    // Create the payment request object
    const paymentRequest: PaymentRequest = {
      recipient: recipientPublicKey,
      amount: amountInLamports,
      reference,
      label: label || '',
      message: message || '',
      memo: memo || '',
    };

    return paymentRequest;
  } catch (error: unknown) {
    console.error('Error creating payment request:', error);
    
    if (error instanceof Error) {
      throw new Error('Failed to create payment request: ' + error.message);
    } else {
      throw new Error('Failed to create payment request: Unknown error occurred');
    }
  }
};

// Function to encode payment URI
export const encodePaymentURI = (paymentRequest: PaymentRequest): string => {
  try {
    const { recipient, amount, reference, label, message, memo } = paymentRequest;
    return encodeURL({
      recipient,
      amount,
      reference,
      label,
      message,
      memo,
    }).toString();
  } catch (error: unknown) {
    console.error('Error encoding payment URI:', error);
    
    if (error instanceof Error) {
      throw new Error('Failed to encode payment URI: ' + error.message);
    } else {
      throw new Error('Failed to encode payment URI: Unknown error occurred');
    }
  }
};

// Function to generate QR code
export const generateQRCode = async (paymentRequest: PaymentRequest): Promise<string> => {
  try {
    const url = encodePaymentURI(paymentRequest);
    const qrCode = createQR(url);
    const qrCodeOptions: CreateQROptions = {
      width: 512,
      height: 512,
      margin: 16,
    };
    return await qrCode.toDataURL(qrCodeOptions);
  } catch (error: unknown) {
    console.error('Error generating QR code:', error);
    
    if (error instanceof Error) {
      throw new Error('Failed to generate QR code: ' + error.message);
    } else {
      throw new Error('Failed to generate QR code: Unknown error occurred');
    }
  }
};

// Function to check transaction status
export const checkTransactionStatus = async (signature: string): Promise<string> => {
  try {
    const status = await connection.getSignatureStatus(signature);
    if (status.value?.confirmationStatus === 'finalized') {
      return 'confirmed';
    } else if (status.value?.confirmationStatus === 'processed') {
      return 'processing';
    } else {
      return 'pending';
    }
  } catch (error: unknown) {
    console.error('Error checking transaction status:', error);
    
    if (error instanceof Error) {
      throw new Error('Failed to check transaction status: ' + error.message);
    } else {
      throw new Error('Failed to check transaction status: Unknown error occurred');
    }
  }
};

// Function to get account balance
export const getAccountBalance = async (address: string): Promise<number> => {
  try {
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error: unknown) {
    console.error('Error getting account balance:', error);
    
    if (error instanceof Error) {
      throw new Error('Failed to get account balance: ' + error.message);
    } else {
      throw new Error('Failed to get account balance: Unknown error occurred');
    }
  }
};