export const MILTON_DECIMALS = 9;
export const SOL_DECIMALS = 9;
export const USDC_DECIMALS = 6;

export const MAX_TRANSACTION_AMOUNT = 18700000000; // in MILTON tokens
export const MIN_TRANSACTION_AMOUNT = 0.000001; // in MILTON tokens

export const TRANSACTION_FEE_PERCENTAGE = 0.1; // 0.1%
export const MAX_TRANSACTION_FEE = 10; // in MILTON tokens

export const GOVERNANCE_PROPOSAL_THRESHOLD = 1000; // Minimum MILTON tokens required to create a proposal
export const GOVERNANCE_VOTING_PERIOD = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const API_REQUEST_TIMEOUT = 30000; // 30 seconds
export const MAX_API_RETRIES = 3;

export const MILTON_PRICE_UPDATE_INTERVAL = 60000; // 1 minute in milliseconds

export const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'de', 'ja'];

export const DEFAULT_AVATAR_URL = '/images/default-avatar.png';

export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/milton_protocol',
  telegram: 'https://t.me/MiltonProtocol',
  discord: 'https://discord.gg/MiltonProtocol',
  github: 'https://github.com/milton-protocol',
};