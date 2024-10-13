import { PublicKey } from '@solana/web3.js'

// Types
interface BlinkParams {
  senderPublicKey: string
  recipientPublicKey: string
  amount: number
  tokenType: string
  message: string
  isRecurring: boolean
  recurringFrequency?: 'daily' | 'weekly' | 'monthly'
}

interface BlinkResult {
  transactionId: string
}

interface UserBalance {
  miltonBalance: number
  usdcBalance: number
  solBalance: number
  [key: string]: number
}

interface TokenInfo {
  milton: { price: number }
  usdc: { price: number }
  sol: { price: number }
  [key: string]: { price: number }
}

interface SPLToken {
  mint: string
  symbol: string
  name: string
}

// API base URL
const API_BASE_URL = 'https://api.milton.io/v1'

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `API error: ${response.statusText}`)
  }
  return response.json()
}

// Send a Blink transaction
export async function sendBlink(params: BlinkParams): Promise<BlinkResult> {
  const response = await fetch(`${API_BASE_URL}/blink`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })
  return handleResponse<BlinkResult>(response)
}

// Get user balance
export async function getUserBalance(publicKey: string): Promise<UserBalance> {
  const response = await fetch(`${API_BASE_URL}/balance/${publicKey}`)
  return handleResponse<UserBalance>(response)
}

// Get token information
export async function getTokenInfo(): Promise<TokenInfo> {
  const response = await fetch(`${API_BASE_URL}/token-info`)
  return handleResponse<TokenInfo>(response)
}

// Get SPL tokens associated with a user's wallet
export async function getSPLTokens(publicKey: string): Promise<SPLToken[]> {
  const response = await fetch(`${API_BASE_URL}/spl-tokens/${publicKey}`)
  return handleResponse<SPLToken[]>(response)
}

// Add a custom SPL token
export async function addCustomSPLToken(publicKey: string, tokenAddress: string): Promise<SPLToken> {
  const response = await fetch(`${API_BASE_URL}/add-custom-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publicKey, tokenAddress }),
  })
  return handleResponse<SPLToken>(response)
}

// Validate a Solana address
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address)
    return true
  } catch {
    return false
  }
}