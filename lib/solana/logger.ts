import winston from 'winston';

// Custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Custom colors for each log level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

// Create a custom format
const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

// Create the logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    customFormat
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Add colors to Winston logger
winston.addColors(colors);

// Extend the logger with Solana-specific logging methods
export interface SolanaLogger extends winston.Logger {
  logTransaction: (signature: string, status: string) => void;
  logAccountCreation: (address: string) => void;
  logProgramInteraction: (programId: string, instruction: string) => void;
}

const solanaLogger: SolanaLogger = logger as SolanaLogger;

solanaLogger.logTransaction = (signature: string, status: string) => {
  logger.info(`Transaction ${signature} ${status}`, { type: 'transaction', signature, status });
};

solanaLogger.logAccountCreation = (address: string) => {
  logger.info(`Account created: ${address}`, { type: 'account_creation', address });
};

solanaLogger.logProgramInteraction = (programId: string, instruction: string) => {
  logger.info(`Program interaction: ${programId} - ${instruction}`, { type: 'program_interaction', programId, instruction });
};

// Error boundary for catching and logging unhandled errors
export function logUnhandledErrors(): void {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    // Consider adding cleanup logic here if necessary
    process.exit(1);
  });
}

export default solanaLogger;
