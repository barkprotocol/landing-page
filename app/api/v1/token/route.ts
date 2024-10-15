import { NextResponse } from 'next/server';

// Sample data to simulate tokens
const tokens = [
  {
    id: 1,
    name: "MILTON",
    symbol: "MILTON",
    totalSupply: 18460000000,
    price: 0.0000001, // Price in SOL
    createdAt: new Date("2024-11-01T12:00:00Z"),
  },
  {
    id: 2,
    name: "TokenX",
    symbol: "TX",
    totalSupply: 5000000,
    price: 0.000005, // Price in SOL
    createdAt: new Date("2024-10-05T12:00:00Z"),
  },
];

// Handler for GET requests
export async function GET() {
  return NextResponse.json(tokens);
}

// Handler for POST requests
export async function POST(request: Request) {
  const { name, symbol, totalSupply, price } = await request.json();

  // Basic validation
  if (!name || !symbol || !totalSupply || !price) {
    return NextResponse.json(
      { message: "All fields are required." },
      { status: 400 }
    );
  }

  // Create a new token object
  const newToken = {
    id: tokens.length + 1,
    name,
    symbol,
    totalSupply,
    price,
    createdAt: new Date(),
  };

  // Push the new token to the tokens array (for demonstration purposes)
  tokens.push(newToken);

  return NextResponse.json(newToken, { status: 201 });
}
