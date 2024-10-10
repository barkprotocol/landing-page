import { pgTable, serial, text, timestamp, numeric, jsonb, boolean, integer } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  solanaAddress: text('solana_address').unique(),
  role: text('role').notNull().default('user'),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id),
  amount: numeric('amount', { precision: 18, scale: 9 }).notNull(),
  currency: text('currency').notNull(), // 'SOL', 'USDC', or 'MILTON'
  type: text('type').notNull(), // 'purchase', 'transfer', 'swap'
  status: text('status').notNull(), // 'pending', 'completed', 'failed'
  signature: text('signature').unique(), // Solana transaction signature
  fromAddress: text('from_address'),
  toAddress: text('to_address'),
  fee: numeric('fee', { precision: 18, scale: 9 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const wallets = pgTable('wallets', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id),
  solBalance: numeric('sol_balance', { precision: 18, scale: 9 }).notNull().default('0'),
  usdcBalance: numeric('usdc_balance', { precision: 18, scale: 9 }).notNull().default('0'),
  miltonBalance: numeric('milton_balance', { precision: 18, scale: 9 }).notNull().default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id),
  preferences: jsonb('preferences').notNull().default({}),
  notifications: boolean('notifications').notNull().default(true),
  twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
  twoFactorSecret: text('two_factor_secret'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const swaps = pgTable('swaps', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id),
  fromCurrency: text('from_currency').notNull(),
  toCurrency: text('to_currency').notNull(),
  fromAmount: numeric('from_amount', { precision: 18, scale: 9 }).notNull(),
  toAmount: numeric('to_amount', { precision: 18, scale: 9 }).notNull(),
  rate: numeric('rate', { precision: 18, scale: 9 }).notNull(),
  status: text('status').notNull(), // 'pending', 'completed', 'failed'
  transactionId: serial('transaction_id').references(() => transactions.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const priceHistory = pgTable('price_history', {
  id: serial('id').primaryKey(),
  currency: text('currency').notNull(),
  price: numeric('price', { precision: 18, scale: 9 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
})

export const referrals = pgTable('referrals', {
  id: serial('id').primaryKey(),
  referrerId: serial('referrer_id').references(() => users.id),
  referredId: serial('referred_id').references(() => users.id),
  status: text('status').notNull(), // 'pending', 'completed'
  reward: numeric('reward', { precision: 18, scale: 9 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
})