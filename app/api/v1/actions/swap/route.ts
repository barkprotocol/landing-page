import { Hono } from 'hono';
import { ActionPostRequest, ActionPostResponse, ActionError } from '@solana/actions';
import jupiterApi from '../../swap';
import { MILTON_LOGO } from '@/lib/solana/constants';
const app = new Hono();

app.post('/:tokenPair', async (c) => {
    const { tokenPair } = c.req.param();
    const { account, amount } = (await c.req.json()) as ActionPostRequest;

    // Validate token pair format
    if (!/^([a-zA-Z0-9]+)-([a-zA-Z0-9]+)$/.test(tokenPair)) {
        return c.json(
            { message: 'Invalid token pair format. Expected format: TOKEN1-TOKEN2.' } satisfies ActionError,
            { status: 400 },
        );
    }

    // Validate amount
    if (isNaN(amount) || parseFloat(amount) <= 0) {
        return c.json(
            { message: 'Invalid amount. Must be a positive number.' } satisfies ActionError,
            { status: 400 },
        );
    }

    const [inputToken, outputToken] = tokenPair.split('-');

    try {
        const [inputTokenMeta, outputTokenMeta] = await Promise.all([
            jupiterApi.lookupToken(inputToken),
            jupiterApi.lookupToken(outputToken),
        ]);

        if (!inputTokenMeta || !outputTokenMeta) {
            return c.json(
                { message: `Token metadata not found for ${tokenPair}.` } satisfies ActionError,
                { status: 422 },
            );
        }

        const tokenUsdPrices = await jupiterApi.getTokenPricesInUsdc([inputTokenMeta.address]);
        const tokenPriceUsd = tokenUsdPrices[inputTokenMeta.address];

        if (!tokenPriceUsd) {
            return c.json(
                { message: `Failed to get price for ${inputTokenMeta.symbol}.` } satisfies ActionError,
                { status: 422 },
            );
        }

        // Calculate the token amount from the input amount in USD
        const tokenAmount = parseFloat(amount) / tokenPriceUsd.price;
        const tokenAmountFractional = Math.ceil(tokenAmount * 10 ** inputTokenMeta.decimals);

        console.log(`Swapping ${tokenAmountFractional} ${inputTokenMeta.symbol} to ${outputTokenMeta.symbol}  
            usd amount: ${amount}
            token usd price: ${tokenPriceUsd.price}
            token amount: ${tokenAmount}
            token amount fractional: ${tokenAmountFractional}`);

        // Get a quote for the swap
        const quote = await jupiterApi.quoteGet({
            inputMint: inputTokenMeta.address,
            outputMint: outputTokenMeta.address,
            amount: tokenAmountFractional,
            autoSlippage: true,
            maxAutoSlippageBps: 500, // 5%
        });

        // Execute the swap
        const swapResponse = await jupiterApi.swapPost({
            swapRequest: {
                quoteResponse: quote,
                userPublicKey: account,
                prioritizationFeeLamports: 'auto',
            },
        });

        // Prepare the response for the action post
        const response: ActionPostResponse = {
            type: 'transaction',
            transaction: swapResponse.swapTransaction,
        };

        return c.json(response);
    } catch (error) {
        console.error('Error during swap operation:', error);
        return c.json(
            { message: `An error occurred during the swap process: ${error.message}` } satisfies ActionError,
            { status: 500 },
        );
    }
});

export default app;
