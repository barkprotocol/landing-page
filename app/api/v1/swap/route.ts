import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import {
  ActionError,
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  LinkedAction,
} from '@solana/actions';
import { jupiterApi } from './api/v1/jupiter-api';
import { rateLimit } from '@/lib/rate-limit';

// Constants
const MILTON_LOGO = process.env.MILTON_LOGO || 'https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg/-/preview/1000x981/-/quality/smart/-/format/auto/';
const SWAP_AMOUNT_USD_OPTIONS = [10, 100, 1000];
const DEFAULT_SWAP_AMOUNT_USD = 10;
const MAX_SWAP_AMOUNT_USD = 10000; // Maximum swap amount in USD
const US_DOLLAR_FORMATTING = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

// Helper function to respond with error
const respondWithError = (message, status) => {
  return NextResponse.json({ error: message }, { status });
};

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const { success } = await rateLimit(request);
    if (!success) return respondWithError('Too many requests', 429);

    const { searchParams } = new URL(request.url);
    const tokenPair = searchParams.get('tokenPair');
    const amount = searchParams.get('amount');

    if (!tokenPair) return respondWithError('Token pair is required', 400);

    const [inputToken, outputToken] = tokenPair.split('-');
    const [inputTokenMeta, outputTokenMeta] = await Promise.all([
      jupiterApi.lookupToken(inputToken),
      jupiterApi.lookupToken(outputToken),
    ]);

    // Check if token metadata exists
    if (!inputTokenMeta || !outputTokenMeta) {
      return NextResponse.json({
        icon: MILTON_LOGO,
        label: 'Not Available',
        title: `Buy ${outputToken}`,
        description: `Buy ${outputToken} with ${inputToken}.`,
        disabled: true,
        error: { message: `Token metadata not found for ${!inputTokenMeta ? inputToken : outputToken}.` },
      } as ActionGetResponse);
    }

    const response: ActionGetResponse = {
      icon: MILTON_LOGO,
      label: `Buy ${outputTokenMeta.symbol}`,
      title: `Buy ${outputTokenMeta.symbol} with ${inputTokenMeta.symbol}`,
      description: `Buy ${outputTokenMeta.symbol} with ${inputTokenMeta.symbol}.` + (amount ? '' : ' Choose a USD amount from the options below, or enter a custom amount.'),
      links: amount ? {} : {
        actions: [
          ...SWAP_AMOUNT_USD_OPTIONS.map((amount) => ({
            type: 'transaction',
            label: `${US_DOLLAR_FORMATTING.format(amount)}`,
            href: `/api/v1/swap?tokenPair=${tokenPair}&amount=${amount}`,
          } as LinkedAction)),
          {
            type: 'transaction',
            href: `/api/v1/swap?tokenPair=${tokenPair}&amount={amount}`,
            label: `Buy ${outputTokenMeta.symbol}`,
            parameters: [{ name: 'amount', label: 'Enter a custom USD amount' }],
          } as LinkedAction,
        ],
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/v1/swap:', error);
    return respondWithError('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const { success } = await rateLimit(request);
    if (!success) return respondWithError('Too many requests', 429);

    const { searchParams } = new URL(request.url);
    const tokenPair = searchParams.get('tokenPair');
    const amount = searchParams.get('amount') || DEFAULT_SWAP_AMOUNT_USD.toString();

    if (!tokenPair) return respondWithError('Token pair is required', 400);

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0 || amountNum > MAX_SWAP_AMOUNT_USD) {
      return respondWithError(`Invalid amount. Must be between 0 and ${MAX_SWAP_AMOUNT_USD}`, 400);
    }

    const [inputToken, outputToken] = tokenPair.split('-');
    const [inputTokenMeta, outputTokenMeta] = await Promise.all([
      jupiterApi.lookupToken(inputToken),
      jupiterApi.lookupToken(outputToken),
    ]);

    // Check if token metadata exists
    if (!inputTokenMeta || !outputTokenMeta) {
      return respondWithError(`Token metadata not found for ${!inputTokenMeta ? inputToken : outputToken}.`, 422);
    }

    const body = await request.json() as ActionPostRequest;
    const { account } = body;

    // Account validation using Solana's PublicKey class
    if (!account || !PublicKey.isOnCurve(new PublicKey(account))) {
      return respondWithError('Invalid or missing account.', 400);
    }

    const tokenUsdPrices = await jupiterApi.getTokenPricesInUsdc([inputTokenMeta.address]);
    const tokenPriceUsd = tokenUsdPrices[inputTokenMeta.address];

    if (!tokenPriceUsd) {
      return respondWithError(`Failed to get price for ${inputTokenMeta.symbol}.`, 422);
    }

    const tokenAmount = amountNum / tokenPriceUsd.price;
    const tokenAmountFractional = Math.ceil(tokenAmount * 10 ** inputTokenMeta.decimals);

    console.log(`Swapping ${tokenAmountFractional} ${inputTokenMeta.symbol} to ${outputTokenMeta.symbol}    
usd amount: ${amountNum}
token usd price: ${tokenPriceUsd.price}
token amount: ${tokenAmount}
token amount fractional: ${tokenAmountFractional}`);

    try {
      const quote = await jupiterApi.quoteGet({
        inputMint: inputTokenMeta.address,
        outputMint: outputTokenMeta.address,
        amount: tokenAmountFractional,
        autoSlippage: true,
        maxAutoSlippageBps: 500, // 5%
      });

      const swapResponse = await jupiterApi.swapPost({
        swapRequest: {
          quoteResponse: quote,
          userPublicKey: account,
          prioritizationFeeLamports: 'auto',
        },
      });

      const response: ActionPostResponse = {
        type: 'transaction',
        transaction: swapResponse.swapTransaction,
      };

      return NextResponse.json(response);
    } catch (error) {
      console.error('Error during swap:', error);
      return respondWithError('Failed to perform swap. Please try again later.', 500);
    }
  } catch (error) {
    console.error('Error in POST /api/v1/swap:', error);
    return respondWithError('Internal server error', 500);
  }
}
