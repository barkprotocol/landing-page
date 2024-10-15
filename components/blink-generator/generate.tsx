'use client';

import React, { useState } from 'react';
import { BlockchainServices } from '@/lib/solana/blockchain-services';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

const GenerateNFT: React.FC = () => {
  const { toast } = useToast();
  const [nftName, setNftName] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  const [nftImageUrl, setNftImageUrl] = useState('');
  const [nftTraits, setNftTraits] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleGenerateNFT = async () => {
    setLoading(true);
    try {
      const attributes = nftTraits.split(',').map((trait) => {
        const [trait_type, value] = trait.split(':').map(item => item.trim());
        return { trait_type, value };
      });
      
      const nftAddress = await BlockchainServices.createAndMintNFT(
        nftName,
        nftDescription,
        nftImageUrl,
        attributes
      );

      toast({
        title: 'NFT Created Successfully',
        description: `NFT Address: ${nftAddress}`,
      });
    } catch (error) {
      toast({
        title: 'NFT Creation Failed',
        description: `Error: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Your NFT</CardTitle>
        <CardDescription>Fill in the details to create a new NFT</CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          type="text"
          placeholder="NFT Name"
          value={nftName}
          onChange={(e) => setNftName(e.target.value)}
          className="mb-4"
        />
        <Input
          type="text"
          placeholder="NFT Description"
          value={nftDescription}
          onChange={(e) => setNftDescription(e.target.value)}
          className="mb-4"
        />
        <Input
          type="text"
          placeholder="Image URL"
          value={nftImageUrl}
          onChange={(e) => setNftImageUrl(e.target.value)}
          className="mb-4"
        />
        <Input
          type="text"
          placeholder="Traits (trait_type:value, ...)"
          value={nftTraits}
          onChange={(e) => setNftTraits(e.target.value)}
          className="mb-4"
        />
        <Button onClick={handleGenerateNFT} disabled={loading}>
          {loading ? 'Generating...' : 'Generate NFT'}
        </Button>
      </CardContent>
      <CardFooter>
        <p>Powered by BARK Protocol</p>
      </CardFooter>
    </Card>
  );
};

export default GenerateNFT;
