import { PublicKey } from '@solana/web3.js';

// Custom error class for Milton program errors
export class MiltonProgramError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MiltonProgramError';
  }
}

// Enum for different types of Milton program errors
export enum MiltonErrorCode {
  InsufficientFunds = 1,
  InvalidInstruction = 2,
  AccountNotFound = 3,
  UnauthorizedAccess = 4,
  InvalidTokenAccount = 5,
  InvalidNFTMetadata = 6,
  StakingPoolFull = 7,
  ProposalAlreadyExecuted = 8,
  VotingPeriodEnded = 9,
  SwapPoolInsufficientLiquidity = 10,
}

// Function to map error codes to human-readable messages
export function getErrorMessage(errorCode: MiltonErrorCode): string {
  switch (errorCode) {
    case MiltonErrorCode.InsufficientFunds:
      return 'Insufficient funds to complete the transaction';
    case MiltonErrorCode.InvalidInstruction:
      return 'Invalid instruction provided to the program';
    case MiltonErrorCode.AccountNotFound:
      return 'Required account not found';
    case MiltonErrorCode.UnauthorizedAccess:
      return 'Unauthorized access to the program or account';
    case MiltonErrorCode.InvalidTokenAccount:
      return 'Invalid token account provided';
    case MiltonErrorCode.InvalidNFTMetadata:
      return 'Invalid NFT metadata';
    case MiltonErrorCode.StakingPoolFull:
      return 'Staking pool is at maximum capacity';
    case MiltonErrorCode.ProposalAlreadyExecuted:
      return 'Governance proposal has already been executed';
    case MiltonErrorCode.VotingPeriodEnded:
      return 'Voting period for the proposal has ended';
    case MiltonErrorCode.SwapPoolInsufficientLiquidity:
      return 'Insufficient liquidity in the swap pool';
    default:
      return 'An unknown error occurred';
  }
}

// Function to create a MiltonProgramError from an error code
export function createMiltonError(errorCode: MiltonErrorCode): MiltonProgramError {
  const message = getErrorMessage(errorCode);
  return new MiltonProgramError(message);
}

// Function to handle and log errors
export function handleMiltonError(error: unknown): void {
  if (error instanceof MiltonProgramError) {
    console.error(`Milton Program Error: ${error.message}`);
  } else if (error instanceof Error) {
    console.error(`Unexpected Error: ${error.message}`);
  } else {
    console.error('An unknown error occurred');
  }
}

// Function to check if a public key is valid
export function isValidPublicKey(key: string): boolean {
  try {
    new PublicKey(key);
    return true;
  } catch {
    return false;
  }
}

// Function to validate input parameters
export function validateParams(params: Record<string, any>): void {
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      throw new MiltonProgramError(`Missing required parameter: ${key}`);
    }
    if (key.toLowerCase().includes('address') && typeof value === 'string' && !isValidPublicKey(value)) {
      throw new MiltonProgramError(`Invalid public key for parameter: ${key}`);
    }
  }
}

// Function to safely execute a program instruction with error handling
export async function safeExecute<T>(
  instruction: () => Promise<T>
): Promise<T> {
  try {
    return await instruction();
  } catch (error) {
    handleMiltonError(error);
    throw error;
  }
}