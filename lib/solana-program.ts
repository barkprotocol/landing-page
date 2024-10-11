import { PublicKey } from '@solana/web3.js';

export const TOKEN_PROGRAM_ID = new PublicKey(process.env.TOKEN_PROGRAM_ID!);
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(process.env.ASSOCIATED_TOKEN_PROGRAM_ID!);
export const MEMO_PROGRAM_ID = new PublicKey(process.env.MEMO_PROGRAM_ID!);

export const MILTON_MINT_ADDRESS = new PublicKey(process.env.MILTON_MINT_ADDRESS!);
export const USDC_TOKEN_ADDRESS = new PublicKey(process.env.USDC_TOKEN_ADDRESS!);