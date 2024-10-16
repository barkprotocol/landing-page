"use client";

import React, { useEffect, useState } from 'react';
import { fetchAvailableNFTs, buyNFT } from '@/lib/api/marketplace';
import { WalletButton } from '@/components/ui/wallet-button';
import { Card } from '@/components/ui/mint-nft-card';

const MarketplacePage: React.FC = () => {
  const [nfts, setNfts] = useState<any[]>([]); // Adjust the type as per your NFT data structure
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available NFTs when the component mounts
  useEffect(() => {
    const fetchNFTs = async () => {
      setLoading(true);
      setError(null); // Reset error state before fetching
      try {
        const availableNFTs = await fetchAvailableNFTs();
        setNfts(availableNFTs);
      } catch (error) {
        console.error('Failed to fetch NFTs:', error);
        setError('Failed to load NFTs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, []);

  const handleBuyNFT = async (nftId: string) => {
    setLoading(true);
    setError(null); // Reset error state before the purchase
    try {
      await buyNFT(nftId);
      // Update the state after purchase
      setNfts((prevNfts) => prevNfts.filter(nft => nft.id !== nftId));
    } catch (error) {
      console.error('Failed to buy NFT:', error);
      setError('Failed to purchase NFT. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Marketplace</h1>

      {loading ? (
        <p>Loading NFTs...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {nfts.map(nft => (
            <Card key={nft.id} nft={nft}>
              <WalletButton onClick={() => handleBuyNFT(nft.id)} className="mt-2">
                Buy NFT
              </WalletButton>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
