"use client"; 

import React, { useEffect, useState } from 'react';
import { fetchAvailableNFTs, buyNFT } from '@/lib/api/marketplace';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui/nft-card';

const MarketplacePage: React.FC = () => {
  const [nfts, setNfts] = useState<any[]>([]); // Adjust the type as per your NFT data structure
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch available NFTs when the component mounts
  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const availableNFTs = await fetchAvailableNFTs();
        setNfts(availableNFTs);
      } catch (error) {
        console.error('Failed to fetch NFTs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, []);

  const handleBuyNFT = async (nftId: string) => {
    setLoading(true);
    try {
      await buyNFT(nftId);
      // Optionally refetch or update the state after purchase
      const updatedNFTs = nfts.filter(nft => nft.id !== nftId);
      setNfts(updatedNFTs);
    } catch (error) {
      console.error('Failed to buy NFT:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Marketplace</h1>

      {loading ? (
        <p>Loading NFTs...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {nfts.map(nft => (
            <Card key={nft.id} nft={nft}>
              <Button onClick={() => handleBuyNFT(nft.id)} className="mt-2">
                Buy NFT
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
