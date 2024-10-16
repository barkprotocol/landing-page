import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  TransactionSignature,
} from '@solana/web3.js';
import {
  encodeURL,
  createQR,
  CreateQROptions,
  ValidateTransferFields,
  TransferRequestURL,
} from '@solana/pay';
import BigNumber from 'bignumber.js';

// Ensure the Solana RPC URL is defined
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
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
  const recipientPublicKey = new PublicKey(recipient);
  const amountInLamports = new BigNumber(amount).times(LAMPORTS_PER_SOL);
  const reference = PublicKey.unique(); // Generate a unique reference key

  return {
    recipient: recipientPublicKey,
    amount: amountInLamports,
    reference,
    label,
    message,
    memo,
  };
};

// Function to encode the payment URI
export const encodePaymentURI = (paymentRequest: PaymentRequest): string => {
  const { recipient, amount, reference, label, message, memo } = paymentRequest;
  return encodeURL({ recipient, amount, reference, label, message, memo }).toString();
};

// Function to generate a QR code for the payment request
export const generateQRCode = async (paymentRequest: PaymentRequest): Promise<string> => {
  const url = encodePaymentURI(paymentRequest);
  const qrCodeOptions: CreateQROptions = {
    width: 512,
    height: 512,
    margin: 16,
  };
  const qrCode = createQR(url);
  return await qrCode.toDataURL(qrCodeOptions);
};

// Function to check the status of a transaction
export const checkTransactionStatus = async (signature: TransactionSignature): Promise<string> => {
  const { value } = await connection.getSignatureStatus(signature);
  return value?.confirmationStatus === 'finalized'
    ? 'confirmed'
    : value?.confirmationStatus === 'processed'
    ? 'processing'
    : 'pending';
};

// Function to get the balance of an account
export const getAccountBalance = async (address: string): Promise<number> => {
  const publicKey = new PublicKey(address);
  const balance = await connection.getBalance(publicKey);
  return balance / LAMPORTS_PER_SOL; // Convert lamports to SOL
};

// Function to validate a transfer URL
export const validateTransferURL = (url: string): boolean => {
  try {
    const parsedURL = new URL(url);
    const params = Object.fromEntries(parsedURL.searchParams);
    ValidateTransferFields(params as TransferRequestURL);
    return true;
  } catch (error) {
    console.error('Error validating transfer URL:', error);
    return false;
  }
};

// Function to parse a transfer URL
export const parseTransferURL = (url: string): PaymentRequest | null => {
  try {
    const parsedURL = new URL(url);
    const params = Object.fromEntries(parsedURL.searchParams);
    ValidateTransferFields(params as TransferRequestURL);

    return {
      recipient: new PublicKey(params.recipient),
      amount: new BigNumber(params.amount || 0),
      reference: new PublicKey(params.reference || PublicKey.unique()),
      label: params.label,
      message: params.message,
      memo: params.memo,
    };
  } catch (error) {
    console.error('Error parsing transfer URL:', error);
    return null;
  }
};

// Function to estimate transaction fee
export const estimateTransactionFee = async (): Promise<number> => {
  const recentBlockhash = await connection.getRecentBlockhash();
  const feeCalculator = await connection.getFeeCalculatorForBlockhash(recentBlockhash.blockhash);

  if (!feeCalculator) {
    throw new Error('Failed to get fee calculator');
  }
  
  return feeCalculator.lamportsPerSignature / LAMPORTS_PER_SOL; // Convert fee to SOL
};
