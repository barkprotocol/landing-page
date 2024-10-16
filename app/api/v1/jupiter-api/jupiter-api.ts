import axios from 'axios';

// Base URL for Jupiter API
const BASE_URL = 'https://api.jup.ag/v1';

// Function to fetch available tokens
export const fetchTokens = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/tokens`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tokens:', error);
    throw error; // Rethrow to handle it in the caller
  }
};

// Function to get swap routes
export const getSwapRoutes = async (inputMint: string, outputMint: string, amount: number) => {
  try {
    const response = await axios.get(`${BASE_URL}/swap`, {
      params: {
        inputMint,
        outputMint,
        amount,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching swap routes:', error);
    throw error; // Rethrow to handle it in the caller
  }
};

// Function to execute a swap
export const executeSwap = async (swapTransaction: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/swap`, swapTransaction);
    return response.data;
  } catch (error) {
    console.error('Error executing swap:', error);
    throw error; // Rethrow to handle it in the caller
  }
};

// Add any other API interactions you need

