"use client";

import React, { useState } from 'react';
import { Button, Input } from '@/components/ui/wallet-button'; 
import { createNFT } from '@/components/blinkboard/create-nft-form';

const GenerateNFTPage: React.FC = () => {
  const [nftName, setNftName] = useState<string>('');
  const [nftDescription, setNftDescription] = useState<string>('');
  const [nftImage, setNftImage] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Handle input change for text fields
  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => 
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setter(event.target.value);
    };

  // Handle image file upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setNftImage(files[0]);
    }
  };

  // Validate input fields
  const validateInputs = (): boolean => {
    if (!nftName || !nftDescription || !nftImage) {
      alert('Please fill in all fields and upload an image.');
      return false;
    }
    return true;
  };

  // Generate NFT by calling the API
  const handleGenerateNFT = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', nftName);
      formData.append('description', nftDescription);
      formData.append('image', nftImage);

      const response = await createNFT(formData);
      setResult(response.data); // Adjust based on your API response structure
    } catch (error) {
      console.error('Error generating NFT:', error);
      alert('Failed to generate NFT. Please try again.'); // Show a user-friendly error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Generate NFT</h1>

      <Input
        type="text"
        value={nftName}
        onChange={handleInputChange(setNftName)}
        placeholder="NFT Name"
        className="mb-4"
      />

      <Input
        type="text"
        value={nftDescription}
        onChange={handleInputChange(setNftDescription)}
        placeholder="NFT Description"
        className="mb-4"
      />

      <Input
        type="file"
        onChange={handleImageUpload}
        className="mb-4"
      />

      <Button 
        onClick={handleGenerateNFT} 
        className="bg-blue-500 text-white" 
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate NFT'}
      </Button>

      {result && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Generated NFT:</h2>
          <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default GenerateNFTPage;
