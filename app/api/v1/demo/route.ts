import { NextResponse } from 'next/server';

// Type definitions
type TokenInfo = {
  supply: number;
  decimals: number;
  price: number;
  treasuryBalance: number;
};

type UserBalance = {
  balance: number;
  staked: number;
};

type UserBalances = Record<string, UserBalance>;

type Referrals = Record<string, string[]>;

// Mock data
const tokenInfo: Record<string, TokenInfo> = {
  milton: {
    supply: 18000000000,
    decimals: 9,
    price: 0.000001,
    treasuryBalance: 500000000,
  },
  usdc: {
    supply: 150000,
    decimals: 6,
    price: 1,
    treasuryBalance: 5000,
  },
};

const userBalances: UserBalances = {
  user1: { balance: 1000, staked: 500 },
  user2: { balance: 2000, staked: 1000 },
  user3: { balance: 3000, staked: 1500 },
};

const referrals: Referrals = {
  user1: ['user2', 'user3'],
  user2: ['user3'],
};

// Simulates a transaction
function simulateTransaction(amount: number, currency: 'SOL' | 'USDC') {
  const transactionId = Math.random().toString(36).substring(2, 15);
  const fee = amount * 0.01; // 1% fee
  const paymentAmount = currency === 'USDC' ? amount : amount / 10; // 1 SOL = 10 USDC for this demo
  const miltonAmount = amount * 10; // 1 USDC = 10 MILTON for this demo

  return {
    transactionId,
    miltonAmount,
    paymentAmount,
    fee,
  };
}

// Stakes tokens for a user
function stakeTokens(userId: string, amount: number) {
  const user = userBalances[userId];
  if (user && user.balance >= amount) {
    user.balance -= amount;
    user.staked += amount;
    return { success: true, newStakeAmount: user.staked };
  }
  return { success: false, newStakeAmount: user?.staked || 0 };
}

// Unstakes tokens for a user
function unstakeTokens(userId: string, amount: number) {
  const user = userBalances[userId];
  if (user && user.staked >= amount) {
    user.balance += amount;
    user.staked -= amount;
    return { success: true, newStakeAmount: user.staked };
  }
  return { success: false, newStakeAmount: user?.staked || 0 };
}

// Adds a referral
function addReferral(referrerId: string, referredId: string) {
  if (!referrals[referrerId]) {
    referrals[referrerId] = [];
  }
  if (!referrals[referrerId].includes(referredId)) {
    referrals[referrerId].push(referredId);
    return true;
  }
  return false;
}

// Gets the leaderboard
function getLeaderboard() {
  return Object.entries(userBalances)
    .map(([userId, { balance, staked }]) => ({
      userId,
      totalBalance: balance + staked,
    }))
    .sort((a, b) => b.totalBalance - a.totalBalance)
    .slice(0, 10); // Top 10 users
}

// Simulates a donation
function simulateDonation(donorId: string, amount: number, recipientId: string) {
  const donor = userBalances[donorId];
  if (donor && donor.balance >= amount) {
    donor.balance -= amount;
    // Log the donation (for example, to a database or similar structure)
    return { success: true, amount, recipientId };
  }
  return { success: false, error: 'Insufficient balance for donation' };
}

// Handles GET requests
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'tokenInfo':
      return NextResponse.json(tokenInfo);
    case 'userBalance': {
      const userId = searchParams.get('userId');
      const userBalance = userId && userBalances[userId] ? userBalances[userId] : null;

      return userBalance
        ? NextResponse.json(userBalance)
        : NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    case 'leaderboard':
      return NextResponse.json(getLeaderboard());
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}

// Handles POST requests
export async function POST(request: Request) {
  const body = await request.json();
  const { action, userId, amount, currency } = body;

  switch (action) {
    case 'transaction':
      if (amount && currency) {
        const transaction = simulateTransaction(Number(amount), currency as 'SOL' | 'USDC');
        return NextResponse.json(transaction);
      }
      return NextResponse.json({ error: 'Missing amount or currency' }, { status: 400 });
    case 'stake':
      if (userId && amount) {
        const result = stakeTokens(userId, Number(amount));
        return NextResponse.json(result);
      }
      return NextResponse.json({ error: 'Missing userId or amount' }, { status: 400 });
    case 'unstake':
      if (userId && amount) {
        const result = unstakeTokens(userId, Number(amount));
        return NextResponse.json(result);
      }
      return NextResponse.json({ error: 'Missing userId or amount' }, { status: 400 });
    case 'referral':
      const { referrerId, referredId } = body;
      if (referrerId && referredId) {
        const success = addReferral(referrerId, referredId);
        return NextResponse.json({ success });
      }
      return NextResponse.json({ error: 'Missing referrerId or referredId' }, { status: 400 });
    case 'donate':
      if (userId && amount && body.recipientId) {
        const result = simulateDonation(userId, Number(amount), body.recipientId);
        return NextResponse.json(result);
      }
      return NextResponse.json({ error: 'Missing userId, amount, or recipientId' }, { status: 400 });
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}
