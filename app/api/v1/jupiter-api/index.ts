import axios from 'axios';

const BASE_URL = 'https://api.jupiter.exchange'; // Adjust this URL if needed

const jupiterApi = {
    // Method to fetch token metadata
    async lookupToken(tokenAddress: string) {
        try {
            const response = await axios.get(`${BASE_URL}/tokens/${tokenAddress}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching token metadata for ${tokenAddress}:`, error);
            throw new Error('Failed to fetch token metadata.');
        }
    },

    // Method to get token prices in USDC
    async getTokenPricesInUsdc(tokenAddresses: string[]) {
        try {
            const response = await axios.get(`${BASE_URL}/prices`, {
                params: { tokens: tokenAddresses.join(',') },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching token prices:', error);
            throw new Error('Failed to fetch token prices.');
        }
    },

    // Method to get a swap quote
    async quoteGet({ inputMint, outputMint, amount, autoSlippage, maxAutoSlippageBps }: {
        inputMint: string;
        outputMint: string;
        amount: number;
        autoSlippage: boolean;
        maxAutoSlippageBps: number;
    }) {
        try {
            const response = await axios.get(`${BASE_URL}/quote`, {
                params: {
                    inputMint,
                    outputMint,
                    amount,
                    autoSlippage,
                    maxAutoSlippageBps,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching swap quote:', error);
            throw new Error('Failed to fetch swap quote.');
        }
    },

    // Method to execute the swap
    async swapPost({ swapRequest }: { swapRequest: any }) {
        try {
            const response = await axios.post(`${BASE_URL}/swap`, swapRequest);
            return response.data;
        } catch (error) {
            console.error('Error executing swap:', error);
            throw new Error('Failed to execute swap.');
        }
    },
};

export default jupiterApi;
