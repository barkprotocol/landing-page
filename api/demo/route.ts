import { NextResponse } from 'next/server'

// Mock data for token info
const tokenInfo = {
  milton: {
    supply: 1000000000,
    decimals: 9,
    price: 0.1,
    treasuryBalance: 500000000,
  },
  usdc: {
    supply: 10000000000,
    decimals: 6,
    price: 1,
    treasuryBalance: 5000000,
  },
}

// Mock data for user balances and stakes
const userBalances: { [key: string]: { balance: number, staked: number } } = {
  'user1': { balance: 1000, staked: 500 },
  'user2': { balance: 2000, staked: 1000 },
  'user3': { balance: 3000, staked: 1500 },
}

// Mock data for referrals
const referrals: { [key: string]: string[] } = {
  'user1': ['user2', 'user3'],
  'user2': ['user3'],
}

// Mock function to simulate a transaction
function simulateTransaction(amount: number, currency: 'SOL' | 'USDC'): {
  transactionId: string
  miltonAmount: number
  paymentAmount: number
  fee: number
} {
  const transactionId = Math.random().toString(36).substring(2, 15)
  const fee = amount * 0.01 // 1% fee
  const paymentAmount = currency === 'USDC' ? amount : amount / 10 // 1 SOL = 10 USDC for this demo
  const miltonAmount = amount * 10 // 1 USDC = 10 MILTON for this demo

  return {
    transactionId,
    miltonAmount,
    paymentAmount,
    fee,
  }
}

// Function to stake tokens
function stakeTokens(userId: string, amount: number): { success: boolean, newStakeAmount: number } {
  if (userBalances[userId] && userBalances[userId].balance >= amount) {
    userBalances[userId].balance -= amount
    userBalances[userId].staked += amount
    return { success: true, newStakeAmount: userBalances[userId].staked }
  }
  return { success: false, newStakeAmount: userBalances[userId]?.staked || 0 }
}

// Function to unstake tokens
function unstakeTokens(userId: string, amount: number): { success: boolean, newStakeAmount: number } {
  if (userBalances[userId] && userBalances[userId].staked >= amount) {
    userBalances[userId].balance += amount
    userBalances[userId].staked -= amount
    return { success: true, newStakeAmount: userBalances[userId].staked }
  }
  return { success: false, newStakeAmount: userBalances[userId]?.staked || 0 }
}

// Function to add a referral
function addReferral(referrerId: string, referredId: string): boolean {
  if (!referrals[referrerId]) {
    referrals[referrerId] = []
  }
  if (!referrals[referrerId].includes(referredId)) {
    referrals[referrerId].push(referredId)
    return true
  }
  return false
}

// Function to get leaderboard
function getLeaderboard(): { userId: string, totalBalance: number }[] {
  return Object.entries(userBalances)
    .map(([userId, { balance, staked }]) => ({
      userId,
      totalBalance: balance + staked,
    }))
    .sort((a, b) => b.totalBalance - a.totalBalance)
    .slice(0, 10) // Top 10 users
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  switch (action) {
    case 'tokenInfo':
      return NextResponse.json(tokenInfo)
    case 'userBalance':
      const userId = searchParams.get('userId')
      if (userId && userBalances[userId]) {
        return NextResponse.json(userBalances[userId])
      }
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    case 'leaderboard':
      return NextResponse.json(getLeaderboard())
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  const { action, userId, amount, currency } = body

  switch (action) {
    case 'transaction':
      if (amount && currency) {
        const transaction = simulateTransaction(Number(amount), currency as 'SOL' | 'USDC')
        return NextResponse.json(transaction)
      }
      return NextResponse.json({ error: 'Missing amount or currency' }, { status: 400 })
    case 'stake':
      if (userId && amount) {
        const result = stakeTokens(userId, Number(amount))
        return NextResponse.json(result)
      }
      return NextResponse.json({ error: 'Missing userId or amount' }, { status: 400 })
    case 'unstake':
      if (userId && amount) {
        const result = unstakeTokens(userId, Number(amount))
        return NextResponse.json(result)
      }
      return NextResponse.json({ error: 'Missing userId or amount' }, { status: 400 })
    case 'referral':
      const { referrerId, referredId } = body
      if (referrerId && referredId) {
        const success = addReferral(referrerId, referredId)
        return NextResponse.json({ success })
      }
      return NextResponse.json({ error: 'Missing referrerId or referredId' }, { status: 400 })
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
}