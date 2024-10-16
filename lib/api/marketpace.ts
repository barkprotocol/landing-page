import axios, { AxiosError } from 'axios';

// Define the base URL for your marketplace API
const BASE_URL = process.env.NEXT_PUBLIC_MARKETPLACE_API_URL || 'https://api.miltonprotocol.com/marketplace';

// Define TypeScript interfaces for your NFT data structures
interface NFT {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  // Add other fields based on your API response structure
}

// Fetch all NFTs available in the marketplace
export const fetchAvailableNFTs = async (): Promise<NFT[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/nfts`);
    return response.data; // Adjust based on your API response structure
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error fetching NFTs:', axiosError);
    throw new Error(axiosError.response?.data?.message || 'Could not fetch NFTs. Please try again later.');
  }
};

// Fetch details of a specific NFT by its ID
export const fetchNFTDetails = async (nftId: string): Promise<NFT> => {
  try {
    const response = await axios.get(`${BASE_URL}/nfts/${nftId}`);
    return response.data; // Adjust based on your API response structure
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error fetching NFT details:', axiosError);
    throw new Error(axiosError.response?.data?.message || 'Could not fetch NFT details. Please try again later.');
  }
};

// Buy an NFT by its ID
export const buyNFT = async (nftId: string, userId: string): Promise<any> => {
  try {
    const response = await axios.post(`${BASE_URL}/nfts/${nftId}/buy`, { userId });
    return response.data; // Adjust based on your API response structure
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error buying NFT:', axiosError);
    throw new Error(axiosError.response?.data?.message || 'Could not buy NFT. Please try again later.');
  }
};

// List an NFT for sale
export const listNFT = async (nftId: string, price: number): Promise<any> => {
  try {
    const response = await axios.post(`${BASE_URL}/nfts/${nftId}/list`, { price });
    return response.data; // Adjust based on your API response structure
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Error listing NFT:', axiosError);
    throw new Error(axiosError.response?.data?.message || 'Could not list NFT. Please try again later.');
  }
};

// Add any additional functions as needed
