import { Cluster, clusterApiUrl, PublicKey } from '@solana/web3.js';

// Determine the network to connect to
export const SOLANA_NETWORK: Cluster = 
  (process.env.NEXT_PUBLIC_SOLANA_NETWORK as Cluster) || 'devnet';

// RPC Endpoint
export const SOLANA_RPC_ENDPOINT = 
  process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || clusterApiUrl(SOLANA_NETWORK);

// Milton token mint address
export const MILTON_MINT = new PublicKey('4DsZctdxSVNLGYB5YtY8A8JDg6tUoSZnQHSamXecKWWf');

// USDC token mint address (this is the devnet address, replace with mainnet address when going live)
export const USDC_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');

// Milton program ID
export const PROGRAM_ID = new PublicKey('YourProgramIdHere');

// Constants for your program
export const MILTON_DECIMALS = 9;
export const USDC_DECIMALS = 6;

// Fee constants
export const TRANSACTION_FEE = 0.000005; // in SOL

// Timeouts and limits
export const TRANSACTION_TIMEOUT = 30000; // 30 seconds
export const MAX_RETRIES = 3;

// Confirmation strategy
export const CONFIRMATION_STRATEGY = {
  maxRetries: 3,
  skipPreflight: true,
};

// Other constants
export const MILTON_PRICE_FEED = 'milton_usdc';
export const SOL_PRICE_FEED = 'sol_usdc';

// Function to get the explorer URL for a given address or transaction
export function getExplorerUrl(
  addressOrSignature: string, 
  type: 'address' | 'tx' = 'address'
): string {
  let baseUrl: string;

  // Determine base URL based on the network
  switch (SOLANA_NETWORK) {
    case 'mainnet-beta':
      baseUrl = 'https://explorer.solana.com';
      break;
    case 'devnet':
      baseUrl = 'https://explorer.solana.com/?cluster=devnet';
      break;
    case 'testnet':
      baseUrl = 'https://explorer.solana.com/?cluster=testnet';
      break;
    default:
      throw new Error(`Unsupported network: ${SOLANA_NETWORK}`);
  }

  return `${baseUrl}/${type}/${addressOrSignature}`;
}

// Function to get the block explorer name
export function getExplorerName(): string {
  return 'Solana Explorer';
}

// Wallet adapter configuration
export const WALLET_ADAPTER_NETWORK = SOLANA_NETWORK;

// List of supported wallet adapters
export const SUPPORTED_WALLETS = [
  'Phantom',
  'Solflare',
  'Ledger',
  'Torus',
];

// Connection config for performance optimization
export const CONNECTION_CONFIG = {
  commitment: 'confirmed' as const,
  disableRetryOnRateLimit: true,
  confirmTransactionInitialTimeout: TRANSACTION_TIMEOUT,
};

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SOLANA_NETWORK) {
  console.warn('Using default Solana network: devnet');
}

if (!process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT) {
  console.warn('Using default RPC endpoint: ' + SOLANA_RPC_ENDPOINT);
}