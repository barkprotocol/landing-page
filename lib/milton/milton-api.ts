import { PublicKey } from '@solana/web3.js';
import { z } from 'zod';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.miltonprotocol.com/v1';

// Existing schemas
const CreateTransactionSchema = z.object({
  senderAddress: z.string(),
  recipientAddress: z.string(),
  amount: z.number().positive(),
  transactionType: z.enum(['SOL', 'MILTON', 'USDC']),
});

const SubmitTransactionSchema = z.object({
  signedTransaction: z.string(),
});

const GetBalanceSchema = z.object({
  address: z.string(),
});

const CreateInvoiceSchema = z.object({
  recipient: z.string(),
  dueDate: z.string(),
  items: z.array(z.object({
    description: z.string(),
    amount: z.number().positive(),
  })),
  notes: z.string().optional(),
  token: z.enum(['SOL', 'MILTON', 'USDC']),
});

const CreateDonationSchema = z.object({
  donorAddress: z.string(),
  recipientAddress: z.string(),
  amount: z.number().positive(),
  token: z.enum(['SOL', 'MILTON', 'USDC']),
  message: z.string().optional(),
});

const CreateGiftSchema = z.object({
  senderAddress: z.string(),
  recipientAddress: z.string(),
  amount: z.number().positive(),
  message: z.string().optional(),
});

const SwapTokensSchema = z.object({
  userAddress: z.string(),
  fromToken: z.enum(['SOL', 'MILTON', 'USDC']),
  toToken: z.enum(['SOL', 'MILTON', 'USDC']),
  amount: z.number().positive(),
});

const CreateProposalSchema = z.object({
  creatorAddress: z.string(),
  title: z.string(),
  description: z.string(),
  options: z.array(z.string()).min(2),
});

const CastVoteSchema = z.object({
  voterAddress: z.string(),
  proposalId: z.string(),
  optionIndex: z.number().int().nonnegative(),
});

// New schemas for payments, NFTs, and transactions
const CreatePaymentSchema = z.object({
  payerAddress: z.string(),
  recipientAddress: z.string(),
  amount: z.number().positive(),
  token: z.enum(['SOL', 'MILTON', 'USDC']),
  description: z.string().optional(),
});

const MintNFTSchema = z.object({
  creatorAddress: z.string(),
  name: z.string(),
  description: z.string(),
  image: z.string().url(),
  attributes: z.array(z.object({
    trait_type: z.string(),
    value: z.string(),
  })).optional(),
});

const TransferNFTSchema = z.object({
  senderAddress: z.string(),
  recipientAddress: z.string(),
  nftMintAddress: z.string(),
});

const GetTransactionDetailsSchema = z.object({
  transactionSignature: z.string(),
});

// Existing types
export type CreateTransactionParams = z.infer<typeof CreateTransactionSchema>;
export type SubmitTransactionParams = z.infer<typeof SubmitTransactionSchema>;
export type GetBalanceParams = z.infer<typeof GetBalanceSchema>;
export type CreateInvoiceParams = z.infer<typeof CreateInvoiceSchema>;
export type CreateDonationParams = z.infer<typeof CreateDonationSchema>;
export type CreateGiftParams = z.infer<typeof CreateGiftSchema>;
export type SwapTokensParams = z.infer<typeof SwapTokensSchema>;
export type CreateProposalParams = z.infer<typeof CreateProposalSchema>;
export type CastVoteParams = z.infer<typeof CastVoteSchema>;
export type CreatePaymentParams = z.infer<typeof CreatePaymentSchema>;
export type MintNFTParams = z.infer<typeof MintNFTSchema>;
export type TransferNFTParams = z.infer<typeof TransferNFTSchema>;
export type GetTransactionDetailsParams = z.infer<typeof GetTransactionDetailsSchema>;

// API utility functions
async function apiRequest<T>(endpoint: string, method: string, data?: any): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'An unexpected error occurred');
  }

  return response.json();
}

export const MiltonAPI = {
  // Existing methods
  createTransaction: async (params: CreateTransactionParams): Promise<{ transaction: string }> => {
    CreateTransactionSchema.parse(params);
    return apiRequest('/transactions/create', 'POST', params);
  },

  submitTransaction: async (params: SubmitTransactionParams): Promise<{ signature: string }> => {
    SubmitTransactionSchema.parse(params);
    return apiRequest('/transactions/submit', 'POST', params);
  },

  getBalance: async (params: GetBalanceParams): Promise<{ balance: number }> => {
    GetBalanceSchema.parse(params);
    return apiRequest(`/balance?address=${params.address}`, 'GET');
  },

  createInvoice: async (params: CreateInvoiceParams): Promise<{ invoiceId: string }> => {
    CreateInvoiceSchema.parse(params);
    return apiRequest('/invoice', 'POST', params);
  },

  getInvoice: async (invoiceId: string): Promise<any> => {
    return apiRequest(`/invoice?invoiceId=${invoiceId}`, 'GET');
  },

  getTransactionHistory: async (address: string): Promise<any[]> => {
    return apiRequest(`/transactions/history?address=${address}`, 'GET');
  },

  getMiltonPrice: async (): Promise<{ price: number }> => {
    return apiRequest('/milton/price', 'GET');
  },

  getExchangeRates: async (): Promise<{ [key: string]: number }> => {
    return apiRequest('/exchange-rates', 'GET');
  },

  createDonation: async (params: CreateDonationParams): Promise<{ donationId: string }> => {
    CreateDonationSchema.parse(params);
    return apiRequest('/donations', 'POST', params);
  },

  getDonation: async (donationId: string): Promise<any> => {
    return apiRequest(`/donations?donationId=${donationId}`, 'GET');
  },

  createGift: async (params: CreateGiftParams): Promise<{ giftId: string }> => {
    CreateGiftSchema.parse(params);
    return apiRequest('/gifts', 'POST', params);
  },

  getGift: async (giftId: string): Promise<any> => {
    return apiRequest(`/gifts?giftId=${giftId}`, 'GET');
  },

  swapTokens: async (params: SwapTokensParams): Promise<{ transactionId: string }> => {
    SwapTokensSchema.parse(params);
    return apiRequest('/swap', 'POST', params);
  },

  createProposal: async (params: CreateProposalParams): Promise<{ proposalId: string }> => {
    CreateProposalSchema.parse(params);
    return apiRequest('/governance/proposals', 'POST', params);
  },

  getProposal: async (proposalId: string): Promise<any> => {
    return apiRequest(`/governance/proposals?proposalId=${proposalId}`, 'GET');
  },

  listProposals: async (): Promise<any[]> => {
    return apiRequest('/governance/proposals', 'GET');
  },

  castVote: async (params: CastVoteParams): Promise<{ success: boolean }> => {
    CastVoteSchema.parse(params);
    return apiRequest('/governance/vote', 'POST', params);
  },

  getVotingPower: async (address: string): Promise<{ votingPower: number }> => {
    return apiRequest(`/governance/voting-power?address=${address}`, 'GET');
  },

  // New methods for payments, NFTs, and transactions
  createPayment: async (params: CreatePaymentParams): Promise<{ paymentId: string }> => {
    CreatePaymentSchema.parse(params);
    return apiRequest('/payments', 'POST', params);
  },

  getPayment: async (paymentId: string): Promise<any> => {
    return apiRequest(`/payments?paymentId=${paymentId}`, 'GET');
  },

  mintNFT: async (params: MintNFTParams): Promise<{ nftMintAddress: string }> => {
    MintNFTSchema.parse(params);
    return apiRequest('/nft/mint', 'POST', params);
  },

  transferNFT: async (params: TransferNFTParams): Promise<{ transactionSignature: string }> => {
    TransferNFTSchema.parse(params);
    return apiRequest('/nft/transfer', 'POST', params);
  },

  getNFTMetadata: async (nftMintAddress: string): Promise<any> => {
    return apiRequest(`/nft/metadata?nftMintAddress=${nftMintAddress}`, 'GET');
  },

  getTransactionDetails: async (params: GetTransactionDetailsParams): Promise<any> => {
    GetTransactionDetailsSchema.parse(params);
    return apiRequest(`/transactions/details?signature=${params.transactionSignature}`, 'GET');
  },
};

// Existing utility functions
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export function formatMiltonAmount(amount: number): string {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function parseMiltonAmount(amount: string): number {
  const parsed = parseFloat(amount.replace(/,/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}