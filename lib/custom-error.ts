export enum ErrorType {
  RateLimitExceeded = 'RateLimitExceeded',
  Unauthorized = 'Unauthorized',
  InvalidSignature = 'InvalidSignature',
  TransactionSimulationFailed = 'TransactionSimulationFailed',
  TransactionNotFound = 'TransactionNotFound',
  TransactionExpired = 'TransactionExpired',
  TransactionFailed = 'TransactionFailed',
  SlippageExceeded = 'SlippageExceeded',
  InvalidInput = 'InvalidInput',
  ExternalApiError = 'ExternalApiError',
  InsufficientFunds = 'InsufficientFunds',
  TokenAccountError = 'TokenAccountError',
  BlockchainError = 'BlockchainError',
  NetworkError = 'NetworkError',
}

export class CustomError extends Error {
  constructor(public type: ErrorType, message: string) {
    super(message)
    this.name = 'CustomError'
  }

  get statusCode(): number {
    switch (this.type) {
      case ErrorType.RateLimitExceeded:
        return 429
      case ErrorType.Unauthorized:
      case ErrorType.InvalidSignature:
        return 401
      case ErrorType.TransactionSimulationFailed:
      case ErrorType.TransactionNotFound:
      case ErrorType.TransactionExpired:
      case ErrorType.TransactionFailed:
      case ErrorType.SlippageExceeded:
      case ErrorType.InsufficientFunds:
      case ErrorType.TokenAccountError:
        return 400
      case ErrorType.InvalidInput:
        return 422
      case ErrorType.ExternalApiError:
      case ErrorType.NetworkError:
        return 503
      case ErrorType.BlockchainError:
        return 502
      default:
        return 500
    }
  }

  toJSON() {
    return {
      error: this.type,
      message: this.message,
      statusCode: this.statusCode,
    }
  }
}