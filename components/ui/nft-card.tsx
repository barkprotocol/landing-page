import React from 'react';
import { Button } from '@/components/ui/mint-nft-button';

interface NftCardProps {
  id: string;
  imageUrl: string;
  name: string;
  description: string;
  price: number;
  onBuy: (id: string) => void;
}

const NftCard: React.FC<NftCardProps> = ({ id, imageUrl, name, description, price, onBuy }) => {
  return (
    <div className="border p-4 rounded-lg shadow-md">
      <img src={imageUrl} alt={name} className="w-full h-auto mb-2 rounded" />
      <h2 className="text-xl font-semibold">{name}</h2>
      <p className="mb-2">{description}</p>
      <p className="font-bold">${price.toFixed(2)}</p>
      <Button onClick={() => onBuy(id)} className="bg-blue-500 text-white mt-2">
        Buy Now
      </Button>
    </div>
  );
};

export default NftCard;
