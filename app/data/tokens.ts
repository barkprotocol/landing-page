import { PublicKey } from '@solana/web3.js';

export interface Token {
  symbol: string;
  name: string;
  mintAddress: PublicKey;
  decimals: number;
  logoURI: string;
}

export const tokens: Token[] = [
  {
    symbol: 'MILTON',
    name: 'MILTON',
    mintAddress: new PublicKey(process.env.NEXT_PUBLIC_MILTON_MINT_ADDRESS!),
    decimals: 9,
    logoURI: 'https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg',
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    mintAddress: new PublicKey('So11111111111111111111111111111111111111112'),
    decimals: 9,
    logoURI: 'https://cryptologos.cc/solana',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    mintAddress: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    decimals: 6,
    logoURI: 'https://cryptologos.cc/usd-coin',
  },
];

export function getTokenBySymbol(symbol: string): Token | undefined {
  return tokens.find(token => token.symbol === symbol);
}

export function getTokenByMintAddress(mintAddress: string): Token | undefined {
  return tokens.find(token => token.mintAddress.toBase58() === mintAddress);
}