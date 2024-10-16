import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Input } from 'your-component-library'; // Adjust this import based on your UI library
import { createNFT } from '../../../api/nft'; // Adjust the import path based on your project structure

const GenerateNFTPage = () => {
  const [nftName, setNftName] = useState('');
  const [nftDescription, setNftDescription] = useState('');
  const [nftImage, setNftImage] = useState<File | null>(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerateNFT = async () => {
    if (!nftName || !nftDescription || !nftImage) {
      alert('Please fill in all fields and upload an image.');
      return;
    }

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
      // Handle error (e.g., show a notification)
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
        onChange={(e) => setNftName(e.target.value)}
        placeholder="NFT Name"
        className="mb-4"
      />
      
      <Input
        type="text"
        value={nftDescription}
        onChange={(e) => setNftDescription(e.target.value)}
        placeholder="NFT Description"
        className="mb-4"
      />
      
      <Input
        type="file"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            setNftImage(e.target.files[0]);
          }
        }}
        className="mb-4"
      />

      <Button onClick={handleGenerateNFT} className="bg-blue-500 text-white" disabled={loading}>
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
