import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { db } from '@/lib/db/drizzle';
import { transactions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// Function to handle GET requests to fetch user transactions
async function handleGetTransactions(userId: string) {
  const userTransactions = await db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
    columns: {
      id: true,
      amount: true,
      type: true,
      createdAt: true,
      status: true,
    },
  });

  return userTransactions.map(transaction => ({
    id: transaction.id,
    amount: transaction.amount,
    type: transaction.type,
    date: transaction.createdAt.toISOString(),
    status: transaction.status,
  }));
}

// Function to handle POST requests to create a new transaction
async function handlePostTransaction(body: any, userId: string) {
  // Logic for creating a new transaction, ensure to validate input
  const { amount, type } = body;

  // Example of a basic validation (expand as needed)
  if (!amount || !type) {
    return { error: 'Amount and type are required' };
  }

  // Insert new transaction into the database
  const newTransaction = await db.insert(transactions).values({
    userId,
    amount,
    type,
    status: 'pending', // Set default status or derive from input
    createdAt: new Date(),
  });

  return newTransaction;
}

// Main handler function for the API route
export async function POST(request: Request) {
  try {
    const session = await getServerSession({ req: request }, authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const transactionResult = await handlePostTransaction(body, session.user.id);

    if (transactionResult.error) {
      return NextResponse.json({ error: transactionResult.error }, { status: 400 });
    }

    return NextResponse.json({ message: 'Transaction created successfully!', transaction: transactionResult }, { status: 201 });
  } catch (error) {
    console.error('Error processing transaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession({ req: request }, authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const transactions = await handleGetTransactions(session.user.id);
    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
