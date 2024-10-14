import winston from 'winston';
import path from 'path';

// Create a logger instance
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Log errors to the console
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    // Log errors to a file
    new winston.transports.File({
      filename: path.join(__dirname, 'error.log'),
      level: 'error',
    }),
  ],
});

/**
 * Logs error messages with a timestamp.
 * @param error - The error to be logged.
 */
export const logError = (error: Error) => {
  logger.error({
    message: error.message,
    stack: error.stack,
  });
};
