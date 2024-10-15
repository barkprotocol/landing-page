import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { db } from '@/lib/db/drizzle';
import { validateNFT } from '@/lib/validators'; // Adjust the import path as needed
import { mintNFT } from '@/lib/solana/nft'; // Function to handle minting NFT
import { nfts } from '@/lib/db/schema'; // Assuming you have an NFT schema defined
import { eq } from 'drizzle-orm';

// Function to handle NFT creation
async function handleCreateNFT(body: any, userId: string) {
  const { name, description, image, metadata } = body;

  // Validate the NFT data
  const { error } = validateNFT({ name, description, image, metadata });
  if (error) {
    return { error: error.message };
  }

  // Mint the NFT on the blockchain
  const mintResult = await mintNFT({ name, description, image, metadata }, userId);
  if (mintResult.error) {
    return { error: mintResult.error };
  }

  // Insert the NFT into the database
  const newNFT = await db.insert(nfts).values({
    userId,
    name,
    description,
    image,
    metadata,
    transactionId: mintResult.transactionId, // Assuming mintResult contains a transactionId
    createdAt: new Date(),
  });

  return newNFT;
}

// Main handler function for the API route
export async function POST(request: Request) {
  try {
    const session = await getServerSession({ req: request }, authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const nftResult = await handleCreateNFT(body, session.user.id);

    if (nftResult.error) {
      return NextResponse.json({ error: nftResult.error }, { status: 400 });
    }

    return NextResponse.json({ message: 'NFT created successfully!', nft: nftResult }, { status: 201 });
  } catch (error) {
    console.error('Error creating NFT:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
