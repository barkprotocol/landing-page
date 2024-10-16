// Enum for different types of Milton program errors
export enum ErrorType {
    // General errors
    UnknownError = 'UnknownError',
    InternalError = 'InternalError',
    InvalidInput = 'InvalidInput',
    Unauthorized = 'Unauthorized',
  
    // Transaction errors
    TransactionFailed = 'TransactionFailed',
    InsufficientFunds = 'InsufficientFunds',
    InvalidInstruction = 'InvalidInstruction',
  
    // Account errors
    AccountNotFound = 'AccountNotFound',
    InvalidAccount = 'InvalidAccount',
    AccountAlreadyExists = 'AccountAlreadyExists',
  
    // Token errors
    InvalidTokenAccount = 'InvalidTokenAccount',
    InsufficientTokenBalance = 'InsufficientTokenBalance',
  
    // NFT errors
    InvalidNFTMetadata = 'InvalidNFTMetadata',
    NFTMintFailed = 'NFTMintFailed',
    NFTTransferFailed = 'NFTTransferFailed',
  
    // Staking errors
    StakingPoolFull = 'StakingPoolFull',
    InvalidStakingPeriod = 'InvalidStakingPeriod',
    UnstakingBeforeLockPeriod = 'UnstakingBeforeLockPeriod',
  
    // Governance errors
    ProposalCreationFailed = 'ProposalCreationFailed',
    ProposalAlreadyExecuted = 'ProposalAlreadyExecuted',
    VotingPeriodEnded = 'VotingPeriodEnded',
    InsufficientVotingPower = 'InsufficientVotingPower',
  
    // Swap errors
    SwapPoolInsufficientLiquidity = 'SwapPoolInsufficientLiquidity',
    ExcessiveSlippage = 'ExcessiveSlippage',
    InvalidSwapPair = 'InvalidSwapPair',
  
    // API errors
    APIRequestFailed = 'APIRequestFailed',
    RateLimitExceeded = 'RateLimitExceeded',
  
    // Wallet errors
    WalletConnectionFailed = 'WalletConnectionFailed',
    SignatureRejected = 'SignatureRejected',
  
    // Network errors
    NetworkError = 'NetworkError',
    RPCError = 'RPCError',
  }
  
  // Interface for error details
  export interface ErrorDetails {
    type: ErrorType;
    message: string;
    data?: any;
  }
  
  // Function to create an ErrorDetails object
  export function createErrorDetails(type: ErrorType, message: string, data?: any): ErrorDetails {
    return { type, message, data };
  }
  
  // Function to get a human-readable error message from an ErrorType
  export function getErrorMessage(errorType: ErrorType): string {
    switch (errorType) {
      case ErrorType.UnknownError:
        return 'An unknown error occurred';
      case ErrorType.InternalError:
        return 'An internal error occurred';
      case ErrorType.InvalidInput:
        return 'Invalid input provided';
      case ErrorType.Unauthorized:
        return 'Unauthorized access';
      case ErrorType.TransactionFailed:
        return 'Transaction failed to complete';
      case ErrorType.InsufficientFunds:
        return 'Insufficient funds to complete the transaction';
      case ErrorType.InvalidInstruction:
        return 'Invalid instruction provided to the program';
      case ErrorType.AccountNotFound:
        return 'Required account not found';
      case ErrorType.InvalidAccount:
        return 'Invalid account provided';
      case ErrorType.AccountAlreadyExists:
        return 'Account already exists';
      case ErrorType.InvalidTokenAccount:
        return 'Invalid token account provided';
      case ErrorType.InsufficientTokenBalance:
        return 'Insufficient token balance';
      case ErrorType.InvalidNFTMetadata:
        return 'Invalid NFT metadata';
      case ErrorType.NFTMintFailed:
        return 'Failed to mint NFT';
      case ErrorType.NFTTransferFailed:
        return 'Failed to transfer NFT';
      case ErrorType.StakingPoolFull:
        return 'Staking pool is at maximum capacity';
      case ErrorType.InvalidStakingPeriod:
        return 'Invalid staking period';
      case ErrorType.UnstakingBeforeLockPeriod:
        return 'Cannot unstake before lock period ends';
      case ErrorType.ProposalCreationFailed:
        return 'Failed to create governance proposal';
      case ErrorType.ProposalAlreadyExecuted:
        return 'Governance proposal has already been executed';
      case ErrorType.VotingPeriodEnded:
        return 'Voting period for the proposal has ended';
      case ErrorType.InsufficientVotingPower:
        return 'Insufficient voting power';
      case ErrorType.SwapPoolInsufficientLiquidity:
        return 'Insufficient liquidity in the swap pool';
      case ErrorType.ExcessiveSlippage:
        return 'Swap failed due to excessive slippage';
      case ErrorType.InvalidSwapPair:
        return 'Invalid token pair for swap';
      case ErrorType.APIRequestFailed:
        return 'API request failed';
      case ErrorType.RateLimitExceeded:
        return 'Rate limit exceeded';
      case ErrorType.WalletConnectionFailed:
        return 'Failed to connect to wallet';
      case ErrorType.SignatureRejected:
        return 'Transaction signature was rejected';
      case ErrorType.NetworkError:
        return 'Network error occurred';
      case ErrorType.RPCError:
        return 'RPC error occurred';
      default:
        return 'An unexpected error occurred';
    }
  }