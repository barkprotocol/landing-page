import jupiterApi from './api/v1/jupiter-api';
import {
  ActionError,
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse, LinkedAction,
} from '@solana/actions';
import { Hono } from 'hono';

export const MILTON_LOGO =
  'https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg/-/preview/1000x981/-/quality/smart/-/format/auto/';

const SWAP_AMOUNT_USD_OPTIONS = [10, 100, 1000];
const DEFAULT_SWAP_AMOUNT_USD = 10;
const US_DOLLAR_FORMATTING = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const app = new Hono();

app.get('/:tokenPair', async (c) => {
    const tokenPair = c.req.param('tokenPair');

    const [inputToken, outputToken] = tokenPair.split('-');
    const [inputTokenMeta, outputTokenMeta] = await Promise.all([
      jupiterApi.lookupToken(inputToken),
      jupiterApi.lookupToken(outputToken),
    ]);

    if (!inputTokenMeta || !outputTokenMeta) {
      return c.json({
        icon: MILTON_LOGO,
        label: 'Not Available',
        title: `Buy ${outputToken}`,
        description: `Buy ${outputToken} with ${inputToken}.`,
        disabled: true,
        error: {
          message: `Token metadata not found.`,
        },
      } satisfies ActionGetResponse);
    }

    const amountParameterName = 'amount';
    const response: ActionGetResponse = {
      type: 'action',
      icon: MILTON_LOGO,
      label: `Buy ${outputTokenMeta.symbol}`,
      title: `Buy ${outputTokenMeta.symbol}`,
      description: `Buy ${outputTokenMeta.symbol} with ${inputTokenMeta.symbol}. Choose a USD amount of ${inputTokenMeta.symbol} from the options below, or enter a custom amount.`,
      links: {
        actions: [
          ...SWAP_AMOUNT_USD_OPTIONS.map((amount) => ({
            type: 'transaction',
            label: `${US_DOLLAR_FORMATTING.format(amount)}`,
            href: `/api/v1/jupiter/swap/${tokenPair}/${amount}`,
          } satisfies LinkedAction)),
          {
            type: 'transaction',
            href: `/api/v1/jupiter/swap/${tokenPair}/{${amountParameterName}}`,
            label: `Buy ${outputTokenMeta.symbol}`,
            parameters: [
              {
                name: amountParameterName,
                label: 'Enter a custom USD amount',
              },
            ],
          } satisfies LinkedAction,
        ],
      },
    };

    return c.json(response);
  },
);

app.get('/:tokenPair/:amount?', async (c) => {
    const { tokenPair } = c.req.param();
    const [inputToken, outputToken] = tokenPair.split('-');
    const [inputTokenMeta, outputTokenMeta] = await Promise.all([
      jupiterApi.lookupToken(inputToken),
      jupiterApi.lookupToken(outputToken),
    ]);

    if (!inputTokenMeta || !outputTokenMeta) {
      return c.json({
        icon: MILTON_LOGO,
        label: 'Not Available',
        title: `Buy ${outputToken}`,
        description: `Buy ${outputToken} with ${inputToken}.`,
        disabled: true,
        error: {
          message: `Token metadata not found.`,
        },
      } satisfies ActionGetResponse);
    }

    const response: ActionGetResponse = {
      icon: MILTON_LOGO,
      label: `Buy ${outputTokenMeta.symbol}`,
      title: `Buy ${outputTokenMeta.symbol} with ${inputTokenMeta.symbol}`,
      description: `Buy ${outputTokenMeta.symbol} with ${inputTokenMeta.symbol}.`,
    };

    return c.json(response);
  },
);

app.post('/:tokenPair/:amount?', async (c) => {
    const tokenPair = c.req.param('tokenPair');
    const amount = c.req.param('amount') ?? DEFAULT_SWAP_AMOUNT_USD.toString();
    const { account } = (await c.req.json()) as ActionPostRequest;

    const [inputToken, outputToken] = tokenPair.split('-');
    const [inputTokenMeta, outputTokenMeta] = await Promise.all([
      jupiterApi.lookupToken(inputToken),
      jupiterApi.lookupToken(outputToken),
    ]);

    if (!inputTokenMeta || !outputTokenMeta) {
      return c.json(
        {
          message: `Token metadata not found.`,
        } satisfies ActionError,
        {
          status: 422,
        },
      );
    }
    const tokenUsdPrices = await jupiterApi.getTokenPricesInUsdc([
      inputTokenMeta.address,
    ]);
    const tokenPriceUsd = tokenUsdPrices[inputTokenMeta.address];
    if (!tokenPriceUsd) {
      return c.json(
        {
          message: `Failed to get price for ${inputTokenMeta.symbol}.`,
        } satisfies ActionError,
        {
          status: 422,
        },
      );
    }
    const tokenAmount = parseFloat(amount) / tokenPriceUsd.price;
    const tokenAmountFractional = Math.ceil(
      tokenAmount * 10 ** inputTokenMeta.decimals,
    );
    console.log(
      `Swapping ${tokenAmountFractional} ${inputTokenMeta.symbol} to ${outputTokenMeta.symbol}    
  usd amount: ${amount}
  token usd price: ${tokenPriceUsd.price}
  token amount: ${tokenAmount}
  token amount fractional: ${tokenAmountFractional}`,
    );

    const quote = await jupiterApi.quoteGet({
      inputMint: inputTokenMeta.address,
      outputMint: outputTokenMeta.address,
      amount: tokenAmountFractional,
      autoSlippage: true,
      maxAutoSlippageBps: 500, // 5%,
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
    return c.json(response);
  },
);

export default app;