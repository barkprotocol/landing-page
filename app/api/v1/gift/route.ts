import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { db } from '@/lib/db/drizzle';
import { gifts, users } from '@/lib/db/schema'; // Adjust according to your schema
import { eq } from 'drizzle-orm';

// Function to handle sending a gift
async function handleSendGift(body: any, senderId: string) {
  const { recipientEmail, amount, message } = body;

  // Basic validation
  if (!recipientEmail || !amount) {
    return { error: 'Recipient email and amount are required.' };
  }

  // Logic to find the recipient by email
  const recipient = await db.query.users.findFirst({
    where: eq(users.email, recipientEmail),
    columns: {
      id: true,
    },
  });

  if (!recipient) {
    return { error: 'Recipient not found.' };
  }

  // Insert the gift into the database
  const newGift = await db.insert(gifts).values({
    senderId,
    recipientId: recipient.id,
    amount,
    message,
    createdAt: new Date(),
  });

  return newGift;
}

// Function to handle fetching gift history for a user
async function handleGetGiftHistory(userId: string) {
  const giftHistory = await db.query.gifts.findMany({
    where: eq(gifts.senderId, userId),
    with: {
      recipient: {
        columns: {
          email: true,
        },
      },
    },
    columns: {
      id: true,
      amount: true,
      message: true,
      createdAt: true,
    },
  });

  return giftHistory.map(gift => ({
    id: gift.id,
    amount: gift.amount,
    message: gift.message,
    date: gift.createdAt.toISOString(),
    recipientEmail: gift.recipient.email,
  }));
}

// Main handler function for the API route
export async function POST(request: Request) {
  try {
    const session = await getServerSession({ req: request }, authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const giftResult = await handleSendGift(body, session.user.id);

    if (giftResult.error) {
      return NextResponse.json({ error: giftResult.error }, { status: 400 });
    }

    return NextResponse.json({ message: 'Gift sent successfully!', gift: giftResult }, { status: 201 });
  } catch (error) {
    console.error('Error sending gift:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession({ req: request }, authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const giftHistory = await handleGetGiftHistory(session.user.id);
    return NextResponse.json(giftHistory, { status: 200 });
  } catch (error) {
    console.error('Error fetching gift history:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
