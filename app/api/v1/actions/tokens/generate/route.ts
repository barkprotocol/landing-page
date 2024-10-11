import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Connection, PublicKey } from '@solana/web3.js';
import { programs } from '@/metaplex-foundation/mpl-token-metadata';

const { metadata: { Metadata } } = programs;

const SOLANA_RPC_URL = 'https://api.mainnet-beta.solana.com';
const connection = new Connection(SOLANA_RPC_URL);

interface TokenMetadata {
  name: string;
  uri: string;
}

interface TokenJson {
  image: string;
}

interface BlinkData {
  label: string;
  description: string;
  wallet: string;
  mint: string;
  commission?: string;
  percentage?: number;
}

async function getTokenMetadata(mintAddress: PublicKey): Promise<TokenMetadata> {
  const metadataPDA = await Metadata.getPDA(mintAddress);
  const metadata = await Metadata.load(connection, metadataPDA);
  return {
    name: metadata.data.data.name,
    uri: metadata.data.data.uri,
  };
}

async function fetchTokenJson(uri: string): Promise<TokenJson> {
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mint = searchParams.get('mint');

    if (!mint) {
      return NextResponse.json({ error: 'Mint address is required' }, { status: 400 });
    }

    const mintAddress = new PublicKey(mint);

    const tokenMetadata = await getTokenMetadata(mintAddress);
    const tokenJson = await fetchTokenJson(tokenMetadata.uri);

    const icon = tokenJson.image;
    const title = `BUY ${tokenMetadata.name}`;

    return NextResponse.json({ icon, title });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch token data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    console.log('Raw request body:', rawBody);

    let data: BlinkData;
    try {
      data = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { label, description, wallet, mint, commission, percentage } = data;
    if (!label || !description || !wallet || !mint) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const mintAddress = new PublicKey(mint);

    const tokenMetadata = await getTokenMetadata(mintAddress);
    const tokenJson = await fetchTokenJson(tokenMetadata.uri);

    const icon = tokenJson.image;
    const title = `BUY ${tokenMetadata.name}`;

    const client = await clientPromise;
    const db = client.db("Cluster0");

    const result = await db.collection("blinks").insertOne({
      icon,
      label,
      description,
      title,
      wallet,
      mint,
      commission,
      percentage,
      createdAt: new Date()
    });

    const blinkLink = `https://getblink.miltonprotocol.com/api/v1/actions/tokens/${result.insertedId}`;
    return NextResponse.json({ blinkLink });
  } catch (error) {
    console.error('Error generating Blink:', error);
    return NextResponse.json({ error: 'Failed to generate Blink' }, { status: 500 });
  }
}