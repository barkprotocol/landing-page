import { db } from './drizzle';
import { users, referrals, wallets } from './schema'; 

// Create a referral
export async function createReferral(userId: string, referralCode: string) {
  const referral = await db.referrals.create({
    data: {
      userId,
      code: referralCode,
      status: 'PENDING', // Set initial status
      createdAt: new Date(),
    },
  });
  return referral;
}

// Complete a referral
export async function completeReferral(referralId: string) {
  const referral = await db.referrals.update({
    where: { id: referralId },
    data: {
      status: 'COMPLETED', // Update to completed status
      updatedAt: new Date(),
    },
  });
  return referral;
}

// Get user referrals
export async function getUserReferrals(userId: string) {
  const userReferrals = await db.referrals.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }, // Order by creation date
  });
  return userReferrals;
}

// Get user by ID
export async function getUserById(userId: string) {
  const user = await db.users.findUnique({
    where: { id: userId },
  });
  return user;
}

// Update wallet balance
export async function updateWalletBalance(walletId: string, amount: number) {
  const wallet = await db.wallets.update({
    where: { id: walletId },
    data: {
      balance: {
        increment: amount, // Increment the wallet balance by the specified amount
      },
      updatedAt: new Date(),
    },
  });
  return wallet;
}
