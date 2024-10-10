import { PublicKey } from '@solana/web3.js'

// System Program ID
export const SYSTEM_PROGRAM_ID = new PublicKey('11111111111111111111111111111111')

// Token Program ID
export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')

// Associated Token Program ID
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')

// Memo Program ID
export const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr')

// Metadata Program ID (for NFTs)
export const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

// Serum DEX Program ID (for Serum markets)
export const SERUM_DEX_PROGRAM_ID = new PublicKey('9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin')

// Raydium Liquidity Pool Program ID
export const RAYDIUM_LIQUIDITY_POOL_PROGRAM_ID = new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8')

// Token addresses
export const MILTON_TOKEN_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_MILTON_TOKEN_ADDRESS!)
export const USDC_TOKEN_ADDRESS = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
export const USDT_TOKEN_ADDRESS = new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB')
export const SOL_TOKEN_ADDRESS = new PublicKey('So11111111111111111111111111111111111111112')

// Wrapped SOL mint address
export const WRAPPED_SOL_MINT = new PublicKey('So11111111111111111111111111111111111111112')

// Function to get token mint address by symbol
export function getTokenMintBySymbol(symbol: string): PublicKey | undefined {
  const tokenMints: { [key: string]: PublicKey } = {
    'MILTON': MILTON_TOKEN_ADDRESS,
    'USDC': USDC_TOKEN_ADDRESS,
    'USDT': USDT_TOKEN_ADDRESS,
    'SOL': SOL_TOKEN_ADDRESS,
    'WSOL': WRAPPED_SOL_MINT,
  }
  return tokenMints[symbol.toUpperCase()]
}

// Function to check if a public key is a known program ID
export function isKnownProgramId(pubkey: PublicKey): boolean {
  const knownProgramIds = [
    SYSTEM_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    MEMO_PROGRAM_ID,
    METADATA_PROGRAM_ID,
    SERUM_DEX_PROGRAM_ID,
    RAYDIUM_LIQUIDITY_POOL_PROGRAM_ID,
  ]
  return knownProgramIds.some(id => id.equals(pubkey))
}