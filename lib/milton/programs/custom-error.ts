import { ErrorType } from './error-type';

export class CustomError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly data?: any;

  constructor(type: ErrorType, message: string, statusCode: number = 500, data?: any) {
    super(message);
    this.name = 'CustomError';
    this.type = type;
    this.statusCode = statusCode;
    this.data = data;

    // This is necessary for proper prototype chain setup in TypeScript
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  static fromErrorType(type: ErrorType, data?: any): CustomError {
    const message = this.getErrorMessage(type);
    const statusCode = this.getStatusCode(type);
    return new CustomError(type, message, statusCode, data);
  }

  private static getErrorMessage(type: ErrorType): string {
    switch (type) {
      case ErrorType.UnknownError:
        return 'An unknown error occurred';
      case ErrorType.InternalError:
        return 'An internal server error occurred';
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

  private static getStatusCode(type: ErrorType): number {
    switch (type) {
      case ErrorType.InvalidInput:
      case ErrorType.InvalidAccount:
      case ErrorType.InvalidTokenAccount:
      case ErrorType.InvalidNFTMetadata:
      case ErrorType.InvalidStakingPeriod:
      case ErrorType.InvalidSwapPair:
        return 400;
      case ErrorType.Unauthorized:
      case ErrorType.InsufficientVotingPower:
        return 401;
      case ErrorType.AccountNotFound:
        return 404;
      case ErrorType.RateLimitExceeded:
        return 429;
      case ErrorType.InternalError:
      case ErrorType.UnknownError:
      case ErrorType.TransactionFailed:
      case ErrorType.NFTMintFailed:
      case ErrorType.NFTTransferFailed:
      case ErrorType.ProposalCreationFailed:
      case ErrorType.APIRequestFailed:
      case ErrorType.NetworkError:
      case ErrorType.RPCError:
        return 500;
      default:
        return 500;
    }
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      statusCode: this.statusCode,
      data: this.data,
    };
  }
}

export function isCustomError(error: unknown): error is CustomError {
  return error instanceof CustomError;
}

export function handleCustomError(error: unknown): CustomError {
  if (isCustomError(error)) {
    return error;
  }
  if (error instanceof Error) {
    return new CustomError(ErrorType.UnknownError, error.message);
  }
  return new CustomError(ErrorType.UnknownError, 'An unknown error occurred');
}