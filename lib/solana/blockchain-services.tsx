'use client'

import { Connection, PublicKey, Transaction, sendAndConfirmTransaction, Keypair, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, Token } from '@solana/spl-token';
import { SolanaConfig } from './config';
import { createAssociatedTokenAccount, getAssociatedTokenAddress } from '@solana/spl-token';
import { Metaplex, keypairIdentity, bundlrStorage, toMetaplexFile } from '@metaplex-foundation/js';
import axios from 'axios';
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Initialize Solana connection
const connection = new Connection(SolanaConfig.rpcEndpoint, SolanaConfig.commitment);

// Initialize Metaplex
const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(Keypair.fromSecretKey(new Uint8Array(JSON.parse(SolanaConfig.payerPrivateKey)))))
  .use(bundlrStorage());

// Blockchain services class
export class BlockchainServices {
  // Generate a new keypair
  static generateKeypair(): Keypair {
    return Keypair.generate();
  }

  // Create and mint an NFT
  static async createAndMintNFT(
    name: string,
    description: string,
    imageUrl: string,
    attributes: { trait_type: string; value: string }[]
  ): Promise<string> {
    try {
      // Download the image
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(response.data, 'binary');
      const file = toMetaplexFile(imageBuffer, 'image.png');

      // Upload the image to Arweave
      const imageUri = await metaplex.storage().upload(file);

      // Create the NFT metadata
      const { uri } = await metaplex.nfts().uploadMetadata({
        name,
        description,
        image: imageUri,
        attributes,
      });

      // Create the NFT
      const { nft } = await metaplex.nfts().create({
        uri,
        name,
        sellerFeeBasisPoints: 500, // 5% royalty
      });

      return nft.address.toBase58();
    } catch (error) {
      console.error('Error creating and minting NFT:', error);
      throw error;
    }
  }

  // Mint tokens
  static async mintTokens(
    mintAddress: string,
    destinationAddress: string,
    amount: number
  ): Promise<string> {
    try {
      const payer = Keypair.fromSecretKey(new Uint8Array(JSON.parse(SolanaConfig.payerPrivateKey)));
      const mintPublicKey = new PublicKey(mintAddress);
      const destinationPublicKey = new PublicKey(destinationAddress);

      const mint = new Token(connection, mintPublicKey, TOKEN_PROGRAM_ID, payer);

      let associatedTokenAccount;
      try {
        associatedTokenAccount = await getAssociatedTokenAddress(
          mintPublicKey,
          destinationPublicKey,
          false,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );
      } catch (error) {
        // If the associated token account doesn't exist, create it
        associatedTokenAccount = await createAssociatedTokenAccount(
          connection,
          payer,
          mintPublicKey,
          destinationPublicKey
        );
      }

      const transaction = new Transaction().add(
        Token.createMintToInstruction(
          TOKEN_PROGRAM_ID,
          mintPublicKey,
          associatedTokenAccount,
          payer.publicKey,
          [],
          amount
        )
      );

      const signature = await sendAndConfirmTransaction(connection, transaction, [payer], {
        commitment: 'confirmed',
      });

      return signature;
    } catch (error) {
      console.error('Error minting tokens:', error);
      throw error;
    }
  }

  // Swap tokens
  static async swapTokens(
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: number
  ): Promise<string> {
    try {
      const payer = Keypair.fromSecretKey(new Uint8Array(JSON.parse(SolanaConfig.payerPrivateKey)));
      const fromTokenPublicKey = new PublicKey(fromTokenAddress);
      const toTokenPublicKey = new PublicKey(toTokenAddress);

      const fromTokenAccount = await getAssociatedTokenAddress(fromTokenPublicKey, payer.publicKey);
      const toTokenAccount = await getAssociatedTokenAddress(toTokenPublicKey, payer.publicKey);

      const transaction = new Transaction().add(
        Token.createTransferInstruction(
          TOKEN_PROGRAM_ID,
          fromTokenAccount,
          toTokenAccount,
          payer.publicKey,
          [],
          amount
        )
      );

      const signature = await sendAndConfirmTransaction(connection, transaction, [payer], {
        commitment: 'confirmed',
      });

      return signature;
    } catch (error) {
      console.error('Error swapping tokens:', error);
      throw error;
    }
  }

  // Get account balance
  static async getAccountBalance(address: string): Promise<number> {
    try {
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error('Error getting account balance:', error);
      throw error;
    }
  }

  // Other functions omitted for brevity...
}

// Example component
export default function BlockchainServicesExample() {
  const { toast } = useToast();
  const [newKeypair, setNewKeypair] = useState<Keypair | null>(null);

  const handleGenerateKeypair = () => {
    const keypair = BlockchainServices.generateKeypair();
    setNewKeypair(keypair);
    toast({
      title: "New Keypair Generated",
      description: `Public Key: ${keypair.publicKey.toBase58()}`,
    });
  };

  const handleCreateNFT = async () => {
    try {
      const nftAddress = await BlockchainServices.createAndMintNFT(
        'My First NFT',
        'This is a test NFT for Milton Protocol',
        'https://example.com/nft-image.png',
        [{ trait_type: 'Rarity', value: 'Legendary' }]
      );
      toast({
        title: "NFT Created Successfully",
        description: `NFT Address: ${nftAddress}`,
      });
    } catch (error) {
      toast({
        title: "NFT Creation Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleMintTokens = async () => {
    if (!newKeypair) {
      toast({
        title: "Error",
        description: "No keypair available. Generate one first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const signature = await BlockchainServices.mintTokens(
        SolanaConfig.miltonMintAddress,
        newKeypair.publicKey.toBase58(),
        1000000000 // 1 token with 9 decimals
      );
      toast({
        title: "Tokens Minted Successfully",
        description: `Transaction Signature: ${signature}`,
      });
    } catch (error) {
      toast({
        title: "Token Minting Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blockchain Services Example</CardTitle>
        <CardDescription>Generate a keypair and interact with blockchain services</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleGenerateKeypair}>Generate Keypair</Button>
        <Button onClick={handleCreateNFT} className="mt-4">Create NFT</Button>
        <Button onClick={handleMintTokens} className="mt-4">Mint Tokens</Button>
      </CardContent>
      <CardFooter>Powered by Milton Protocol</CardFooter>
    </Card>
  );
}
