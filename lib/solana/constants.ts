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

// Meteora DEX Program ID (for Meteora markets) - Ensure this is correct or replace with actual value
export const METEORA_DEX_PROGRAM_ID = new PublicKey('')

// Raydium Liquidity Pool Program ID
export const RAYDIUM_LIQUIDITY_POOL_PROGRAM_ID = new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8')

// Milton Staking Program ID
export const MILTON_STAKING_PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_MILTON_STAKING_PROGRAM_ID!)

// Milton NFT Program ID
export const MILTON_NFT_PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_MILTON_NFT_PROGRAM_ID!)

// Token addresses
export const MILTON_MINT_ADDRESS = new PublicKey(process.env.NEXT_PUBLIC_MILTON_MINT_ADDRESS!)
export const USDC_TOKEN_ADDRESS = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
export const USDT_MINT_ADDRESS = new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB')
export const SOL_MINT_ADDRESS = new PublicKey('So11111111111111111111111111111111111111112')

// Wrapped SOL mint address
export const WRAPPED_SOL_MINT = new PublicKey('So11111111111111111111111111111111111111112')

// Milton Treasury Wallet
export const MILTON_TREASURY_WALLET = new PublicKey(process.env.NEXT_PUBLIC_MILTON_TREASURY_WALLET!)

// Milton Liquidity Pool
export const MILTON_LIQUIDITY_POOL = new PublicKey(process.env.NEXT_PUBLIC_MILTON_LIQUIDITY_POOL!)

interface TokenInfo {
  symbol: string
  name: string
  mintAddress: PublicKey
  decimals: number
}

// Token information including Milton
export const TOKEN_INFO: { [key: string]: TokenInfo } = {
  'MILTON': {
    symbol: 'MILTON',
    name: 'Milton Token',
    mintAddress: MILTON_MINT_ADDRESS,
    decimals: 9,
  },
  'USDC': {
    symbol: 'USDC',
    name: 'USD Coin',
    mintAddress: USDC_TOKEN_ADDRESS,
    decimals: 6,
  },
  'USDT': {
    symbol: 'USDT',
    name: 'Tether USD',
    mintAddress: USDT_MINT_ADDRESS,
    decimals: 6,
  },
  'SOL': {
    symbol: 'SOL',
    name: 'Solana',
    mintAddress: SOL_MINT_ADDRESS,
    decimals: 9,
  },
  'WSOL': {
    symbol: 'WSOL',
    name: 'Wrapped SOL',
    mintAddress: WRAPPED_SOL_MINT,
    decimals: 9,
  },
}

// Function to get token mint address by symbol
export function getTokenMintBySymbol(symbol: string): PublicKey | undefined {
  const tokenInfo = TOKEN_INFO[symbol.toUpperCase()]
  return tokenInfo ? tokenInfo.mintAddress : undefined
}

// Function to get token info by symbol
export function getTokenInfoBySymbol(symbol: string): TokenInfo | undefined {
  return TOKEN_INFO[symbol.toUpperCase()]
}

// Function to check if a public key is a known program ID
export function isKnownProgramId(pubkey: PublicKey): boolean {
  const knownProgramIds = [
    SYSTEM_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    MEMO_PROGRAM_ID,
    METADATA_PROGRAM_ID,
    METEORA_DEX_PROGRAM_ID,
    RAYDIUM_LIQUIDITY_POOL_PROGRAM_ID,
    MILTON_STAKING_PROGRAM_ID,
    MILTON_NFT_PROGRAM_ID,
  ]
  return knownProgramIds.some(id => id.equals(pubkey))
}

// Function to get program name by public key
export function getProgramName(pubkey: PublicKey): string {
  const programMap: { [key: string]: string } = {
    [SYSTEM_PROGRAM_ID.toBase58()]: 'System Program',
    [TOKEN_PROGRAM_ID.toBase58()]: 'Token Program',
    [ASSOCIATED_TOKEN_PROGRAM_ID.toBase58()]: 'Associated Token Program',
    [MEMO_PROGRAM_ID.toBase58()]: 'Memo Program',
    [METADATA_PROGRAM_ID.toBase58()]: 'Metadata Program',
    [METEORA_DEX_PROGRAM_ID.toBase58()]: 'Meteora DEX Program',
    [RAYDIUM_LIQUIDITY_POOL_PROGRAM_ID.toBase58()]: 'Raydium Liquidity Pool Program',
    [MILTON_STAKING_PROGRAM_ID.toBase58()]: 'Milton Staking Program',
    [MILTON_NFT_PROGRAM_ID.toBase58()]: 'Milton NFT Program',
  }
  return programMap[pubkey.toBase58()] || 'Unknown Program'
}

// Function to check if a token is supported by Milton
export function isMiltonSupportedToken(symbol: string): boolean {
  const supportedTokens = ['MILTON', 'USDC', 'USDT', 'SOL', 'WSOL']
  return supportedTokens.includes(symbol.toUpperCase())
}

// Function to get Milton staking pool address
export async function getMiltonStakingPoolAddress(
  stakingProgramId: PublicKey,
  miltonMint: PublicKey
): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddress(
    [Buffer.from('staking_pool'), miltonMint.toBuffer()],
    stakingProgramId
  )
}

// Function to get Milton NFT metadata address
export async function getMiltonNFTMetadataAddress(
  nftProgramId: PublicKey,
  mintAddress: PublicKey
): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddress(
    [Buffer.from('metadata'), mintAddress.toBuffer()],
    nftProgramId
  )
}

export default {
  SYSTEM_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MEMO_PROGRAM_ID,
  METADATA_PROGRAM_ID,
  METEORA_DEX_PROGRAM_ID,
  RAYDIUM_LIQUIDITY_POOL_PROGRAM_ID,
  MILTON_STAKING_PROGRAM_ID,
  MILTON_NFT_PROGRAM_ID,
  MILTON_MINT_ADDRESS,
  USDC_TOKEN_ADDRESS,
  USDT_MINT_ADDRESS,
  SOL_MINT_ADDRESS,
  WRAPPED_SOL_MINT,
  MILTON_TREASURY_WALLET,
  MILTON_LIQUIDITY_POOL,
  TOKEN_INFO,
  getTokenMintBySymbol,
  getTokenInfoBySymbol,
  isKnownProgramId,
  getProgramName,
  isMiltonSupportedToken,
  getMiltonStakingPoolAddress,
  getMiltonNFTMetadataAddress,
}
