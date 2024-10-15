import { Hono } from 'hono';
import { ActionError } from '@solana/actions';
import jupiterApi from './index';

const app = new Hono();

// Endpoint to get token metadata
app.get('/tokens/:tokenAddress', async (c) => {
    const { tokenAddress } = c.req.param();

    try {
        const tokenMeta = await jupiterApi.lookupToken(tokenAddress);

        if (!tokenMeta) {
            return c.json(
                { message: `Token metadata not found for address: ${tokenAddress}` } satisfies ActionError,
                { status: 404 },
            );
        }

        return c.json(tokenMeta);
    } catch (error) {
        console.error('Error fetching token metadata:', error);
        return c.json(
            { message: 'Failed to fetch token metadata.' } satisfies ActionError,
            { status: 500 },
        );
    }
});

// Endpoint to get token prices in USDC
app.get('/prices', async (c) => {
    const { tokens } = c.req.query();

    if (!tokens) {
        return c.json(
            { message: 'Tokens query parameter is required.' } satisfies ActionError,
            { status: 400 },
        );
    }

    const tokenAddresses = tokens.split(',');

    try {
        const prices = await jupiterApi.getTokenPricesInUsdc(tokenAddresses);
        return c.json(prices);
    } catch (error) {
        console.error('Error fetching token prices:', error);
        return c.json(
            { message: 'Failed to fetch token prices.' } satisfies ActionError,
            { status: 500 },
        );
    }
});

// Endpoint to get a swap quote
app.get('/quote', async (c) => {
    const { inputMint, outputMint, amount } = c.req.query();

    if (!inputMint || !outputMint || !amount) {
        return c.json(
            { message: 'Input mint, output mint, and amount are required.' } satisfies ActionError,
            { status: 400 },
        );
    }

    try {
        const quote = await jupiterApi.quoteGet({
            inputMint,
            outputMint,
            amount: parseInt(amount, 10), // Ensure amount is a number
            autoSlippage: true,
            maxAutoSlippageBps: 500, // Example: 5%
        });

        return c.json(quote);
    } catch (error) {
        console.error('Error fetching swap quote:', error);
        return c.json(
            { message: 'Failed to fetch swap quote.' } satisfies ActionError,
            { status: 500 },
        );
    }
});

export default app;
