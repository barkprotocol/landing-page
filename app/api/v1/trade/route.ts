import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { db } from '@/lib/db/drizzle';
import { trades } from '@/lib/db/schema'; // Assuming you have a trades schema defined
import { eq } from 'drizzle-orm';

// Function to handle GET requests to fetch user trades
async function handleGetTrades(userId: string) {
  const userTrades = await db.query.trades.findMany({
    where: eq(trades.userId, userId),
    columns: {
      id: true,
      amount: true,
      asset: true,
      tradeType: true, // e.g., buy/sell
      createdAt: true,
      status: true,
    },
  });

  return userTrades.map(trade => ({
    id: trade.id,
    amount: trade.amount,
    asset: trade.asset,
    tradeType: trade.tradeType,
    date: trade.createdAt.toISOString(),
    status: trade.status,
  }));
}

// Function to handle POST requests to execute a trade
async function handlePostTrade(body: any, userId: string) {
  const { amount, asset, tradeType } = body;

  // Basic validation
  if (!amount || !asset || !tradeType) {
    return { error: 'Amount, asset, and tradeType are required.' };
  }

  // Logic to execute trade (e.g., integrate with a trading service or execute logic)
  const newTrade = await db.insert(trades).values({
    userId,
    amount,
    asset,
    tradeType,
    status: 'pending', // Default status
    createdAt: new Date(),
  });

  return newTrade;
}

// Main handler function for the API route
export async function POST(request: Request) {
  try {
    const session = await getServerSession({ req: request }, authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const tradeResult = await handlePostTrade(body, session.user.id);

    if (tradeResult.error) {
      return NextResponse.json({ error: tradeResult.error }, { status: 400 });
    }

    return NextResponse.json({ message: 'Trade executed successfully!', trade: tradeResult }, { status: 201 });
  } catch (error) {
    console.error('Error executing trade:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession({ req: request }, authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const trades = await handleGetTrades(session.user.id);
    return NextResponse.json(trades, { status: 200 });
  } catch (error) {
    console.error('Error fetching trades:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
