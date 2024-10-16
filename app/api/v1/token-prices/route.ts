import { NextResponse } from 'next/server';

// Define types for token prices
type TokenPrices = {
  MILTON: number;
  BARK: number;
  SOL: number;
  USDC: number;
};

// This is a mock implementation. In a real-world scenario, you'd fetch prices from an actual API.
const mockPrices: TokenPrices = {
  MILTON: 0.1,
  BARK: 0.05,
  SOL: 20,
  USDC: 1,
};

// Function to fetch real token prices (replace this with your API)
async function fetchTokenPrices(): Promise<TokenPrices> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=milton,bark,sol,usd-c&vs_currencies=usd'
    );

    if (!response.ok) {
      throw new Error('Failed to fetch prices from external API');
    }

    const data = await response.json();

    // Map the response to our TokenPrices structure
    return {
      MILTON: data.milton.usd,
      BARK: data.bark.usd,
      SOL: data.sol.usd,
      USDC: data['usd-c'].usd,
    };
  } catch (error) {
    console.error('Error fetching token prices:', error);
    throw new Error('Could not fetch token prices');
  }
}

// API route for fetching token prices
export async function GET() {
  try {
    // Optionally, you could return mock prices or live prices based on an environment variable
    // const prices = await fetchTokenPrices(); // Uncomment to fetch live prices
    const prices = mockPrices; // Comment this line if fetching live prices

    // Simulate API delay (e.g., waiting for an external API response)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Return the prices as a JSON response
    return NextResponse.json(prices);
  } catch (error) {
    console.error('Error fetching token prices:', error);
    
    // Return a 500 error response in case of an issue
    return NextResponse.json({ error: 'Failed to fetch token prices' }, { status: 500 });
  }
}
