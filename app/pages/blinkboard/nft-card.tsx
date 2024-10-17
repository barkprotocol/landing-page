import { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface NFTCardProps {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  rarity: string;
  creator: string;
}

export function NFTCard({ id, name, description, image, price, rarity, creator }: NFTCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleBuy = async () => {
    setIsLoading(true);
    try {
      // Simulating purchase process
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "NFT Purchased!",
        description: `You've successfully purchased ${name} for ${price} SOL.`,
      });
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMint = async () => {
    setIsLoading(true);
    try {
      // Simulating minting process
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "NFT Minted!",
        description: `You've successfully minted a new ${name} NFT.`,
      });
    } catch (error) {
      toast({
        title: "Minting Failed",
        description: "There was an error minting your NFT. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden bg-white text-gray-800 hover:shadow-lg transition-shadow duration-300">
      <img src={image} alt={name} className="w-full h-48 object-cover" />
      <CardContent className="p-4">
        <h4 className="font-bold text-lg mb-2">{name}</h4>
        <p className="text-sm text-gray-600 mb-2">{description}</p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold">Price: {price} SOL</span>
          <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">{rarity}</span>
        </div>
        <p className="text-xs text-gray-500">Created by: {creator}</p>
      </CardContent>
      <CardFooter className="bg-gray-50 p-4 flex justify-between">
        <Button onClick={handleBuy} disabled={isLoading} className="w-[48%]">
          {isLoading ? "Processing..." : "Buy NFT"}
        </Button>
        <Button onClick={handleMint} disabled={isLoading} variant="outline" className="w-[48%]">
          {isLoading ? "Minting..." : "Mint NFT"}
        </Button>
      </CardFooter>
    </Card>
  );
}