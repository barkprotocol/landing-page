import { eq, and, desc, sql } from 'drizzle-orm'
import { db } from './drizzle'
import { users, transactions, wallets, settings, swaps, priceHistory, referrals } from './schema'

// Existing functions...

export async function createSwap(
  userId: number,
  fromCurrency: string,
  toCurrency: string,
  fromAmount: string,
  toAmount: string,
  rate: string,
  status: string,
  transactionId: number
) {
  const [swap] = await db
    .insert(swaps)
    .values({ userId, fromCurrency, toCurrency, fromAmount, toAmount, rate, status, transactionId })
    .returning()
  return swap
}

export async function getUserSwaps(userId: number) {
  return db.select().from(swaps).where(eq(swaps.userId, userId)).orderBy(desc(swaps.createdAt))
}

export async function recordPrice(currency: string, price: string) {
  await db.insert(priceHistory).values({ currency, price })
}

export async function getPriceHistory(currency: string, limit: number = 100) {
  return db
    .select()
    .from(priceHistory)
    .where(eq(priceHistory.currency, currency))
    .orderBy(desc(priceHistory.timestamp))
    .limit(limit)
}

export async function createReferral(referrerId: number, referredId: number) {
  const [referral] = await db
    .insert(referrals)
    .values({ referrerId, referredId, status: 'pending' })
    .returning()
  return referral
}

export async function completeReferral(id: number, reward: string) {
  await db
    .update(referrals)
    .set({ status: 'completed', reward, completedAt: new Date() })
    .where(eq(referrals.id, id))
}

export async function getUserReferrals(userId: number) {
  return db.select().from(referrals).where(eq(referrals.referrerId, userId))
}

export async function updateUserRole(userId: number, role: string) {
  await db.update(users).set({ role }).where(eq(users.id, userId))
}

export async function enable2FA(userId: number, secret: string) {
  await db
    .update(settings)
    .set({ twoFactorEnabled: true, twoFactorSecret: secret })
    .where(eq(settings.userId, userId))
}

export async function disable2FA(userId: number) {
  await db
    .update(settings)
    .set({ twoFactorEnabled: false, twoFactorSecret: null })
    .where(eq(settings.userId, userId))
}

export async function getRecentTransactions(userId: number, limit: number = 10) {
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt))
    .limit(limit)
}

export async function getTotalBalance(userId: number) {
  const [result] = await db
    .select({
      totalBalance: sql<string>`SUM(
        CASE
          WHEN ${wallets.currency} = 'SOL' THEN ${wallets.solBalance} * ${priceHistory.price}
          WHEN ${wallets.currency} = 'USDC' THEN ${wallets.usdcBalance}
          WHEN ${wallets.currency} = 'MILTON' THEN ${wallets.miltonBalance} * ${priceHistory.price}
        END
      )`,
    })
    .from(wallets)
    .innerJoin(
      priceHistory,
      and(
        eq(priceHistory.currency, wallets.currency),
        eq(priceHistory.timestamp, sql`(SELECT MAX(timestamp) FROM ${priceHistory} WHERE currency = ${wallets.currency})`)
      )
    )
    .where(eq(wallets.userId, userId))

  return result?.totalBalance || '0'
}