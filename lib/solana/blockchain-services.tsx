'use client'

import { Connection, PublicKey, Transaction, sendAndConfirmTransaction, Keypair, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
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

// Token metadata
const tokenMetadata = {
  name: "MILTON",
  symbol: "MILTON",
  description: "The native token of the Milton Protocol",
  logoUrl: "https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg",
  website: "https://miltonprotocol.com",
  whitepaper: "https://miltonprotocol.com/whitepaper.pdf"
};

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

      const associatedTokenAddress = await getAssociatedTokenAddress(
        mintPublicKey,
        destinationPublicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

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
          destinationPublicKey,
          { commitment: 'confirmed' }
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

  // Create a transaction with memo
  static async createTransaction(
    fromAddress: string,
    toAddress: string,
    amount: number,
    memo: string
  ): Promise<string> {
    try {
      const payer = Keypair.fromSecretKey(new Uint8Array(JSON.parse(SolanaConfig.payerPrivateKey)));
      const fromPublicKey = new PublicKey(fromAddress);
      const toPublicKey = new PublicKey(toAddress);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromPublicKey,
          toPubkey: toPublicKey,
          lamports: amount,
        })
      );

      // Add memo to the transaction
      const memoProgram = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
      transaction.add({
        keys: [{ pubkey: payer.publicKey, isSigner: true, isWritable: true }],
        programId: memoProgram,
        data: Buffer.from(memo, 'utf-8'),
      });

      const signature = await sendAndConfirmTransaction(connection, transaction, [payer], {
        commitment: 'confirmed',
      });

      return signature;
    } catch (error) {
      console.error('Error creating transaction:', error);
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

  // Create a Blink
  static async createBlink(
    label: string,
    description: string,
    amount: number,
    expiresAt: Date | null,
    maxUses: number | null
  ): Promise<string> {
    try {
      const payer = Keypair.fromSecretKey(new Uint8Array(JSON.parse(SolanaConfig.payerPrivateKey)));
      
      const blinkData = JSON.stringify({
        label,
        description,
        amount,
        expiresAt: expiresAt ? expiresAt.toISOString() : null,
        maxUses,
      });

      const transaction = new Transaction();
      
      // Add memo to the transaction with Blink data
      const memoProgram = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
      transaction.add({
        keys: [{ pubkey: payer.publicKey, isSigner: true, isWritable: true }],
        programId: memoProgram,
        data: Buffer.from(blinkData, 'utf-8'),
      });

      const signature = await sendAndConfirmTransaction(connection, transaction, [payer], {
        commitment: 'confirmed',
      });

      return signature;
    } catch (error) {
      console.error('Error creating Blink:', error);
      throw error;
    }
  }

  // Send a Blink
  static async sendBlink(blinkId: string, recipientAddress: string): Promise<string> {
    try {
      const payer = Keypair.fromSecretKey(new Uint8Array(JSON.parse(SolanaConfig.payerPrivateKey)));
      const recipientPublicKey = new PublicKey(recipientAddress);

      // In a real implementation, you would fetch the Blink details from your backend
      // For this example, we'll use a dummy amount
      const amount = 1000000000; // 1 SOL

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: recipientPublicKey,
          lamports: amount,
        })
      );

      // Add memo to the transaction with Blink ID
      const memoProgram = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
      transaction.add({
        keys: [{ pubkey: payer.publicKey, isSigner: true, isWritable: true }],
        programId: memoProgram,
        data: Buffer.from(`Blink: ${blinkId}`, 'utf-8'),
      });

      const signature = await sendAndConfirmTransaction(connection, transaction, [payer], {
        commitment: 'confirmed',
      });

      return signature;
    } catch (error) {
      console.error('Error sending Blink:', error);
      throw error;
    }
  }

  // Make a donation
  static async makeDonation(recipientAddress: string, amount: number): Promise<string> {
    try {
      const payer = Keypair.fromSecretKey(new Uint8Array(JSON.parse(SolanaConfig.payerPrivateKey)));
      const recipientPublicKey = new PublicKey(recipientAddress);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: recipientPublicKey,
          lamports: amount,
        })
      );

      // Add memo to the transaction
      const memoProgram = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
      transaction.add({
        keys: [{ pubkey: payer.publicKey, isSigner: true, isWritable: true }],
        programId: memoProgram,
        data: Buffer.from('Donation', 'utf-8'),
      });

      const signature = await sendAndConfirmTransaction(connection, transaction, [payer], {
        commitment: 'confirmed',
      });

      return signature;
    } catch (error) {
      console.error('Error making donation:', error);
      throw error;
    }
  }
}

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
    try {
      const signature = await BlockchainServices.mintTokens(
        SolanaConfig.miltonMintAddress,
        newKeypair ? newKeypair.publicKey.toBase58() : 'DESTINATION_ADDRESS_HERE',
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

  const handleSwapTokens = async () => {
    try {
      const signature = await BlockchainServices.swapTokens(
        SolanaConfig.miltonMintAddress,
        SolanaConfig.usdcTokenMintAddress,
        1000000000 // 1 token with 9 decimals
      );
      toast({
        title: "Token Swap Successful",
        description: `Transaction Signature: ${signature}`,
      });
    } catch (error) {
      toast({
        title: "Token Swap Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleCreateTransaction = async () => {
    try {
      const signature = await BlockchainServices.createTransaction(
        newKeypair ? newKeypair.publicKey.toBase58() : 'FROM_ADDRESS_HERE',
        'TO_ADDRESS_HERE',
        1000000000, // 1 SOL
        'Payment for services'
      );
      toast({
        title: "Transaction Created Successfully",
        description: `Transaction Signature: ${signature}`,
      });
    } catch (error) {
      toast({
        title: "Transaction Creation  Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleGetBalance = async () => {
    if (!newKeypair) {
      toast({
        title: "No Keypair Available",
        description: "Please generate a keypair first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const balance = await BlockchainServices.getAccountBalance(newKeypair.publicKey.toBase58());
      toast({
        title: "Account Balance",
        description: `Balance: ${balance} SOL`,
      });
    } catch (error) {
      toast({
        title: "Failed to Get Balance",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleCreateBlink = async () => {
    try {
      const signature = await BlockchainServices.createBlink(
        'Test Blink',
        'This is a test Blink',
        1000000000, // 1 SOL
        new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours
        5 // Max 5 uses
      );
      toast({
        title: "Blink Created Successfully",
        description: `Transaction Signature: ${signature}`,
      });
    } catch (error) {
      toast({
        title: "Blink Creation Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleSendBlink = async () => {
    try {
      const signature = await BlockchainServices.sendBlink(
        'BLINK_ID_HERE',
        newKeypair ? newKeypair.publicKey.toBase58() : 'RECIPIENT_ADDRESS_HERE'
      );
      toast({
        title: "Blink Sent Successfully",
        description: `Transaction Signature: ${signature}`,
      });
    } catch (error) {
      toast({
        title: "Blink Sending Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleMakeDonation = async () => {
    try {
      const signature = await BlockchainServices.makeDonation(
        newKeypair ? newKeypair.publicKey.toBase58() : 'RECIPIENT_ADDRESS_HERE',
        100000000 // 0.1 SOL
      );
      toast({
        title: "Donation Made Successfully",
        description: `Transaction Signature: ${signature}`,
      });
    } catch (error) {
      toast({
        title: "Donation Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Blockchain Services</CardTitle>
        <CardDescription>Interact with Milton Protocol blockchain services</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <Button onClick={handleGenerateKeypair} variant="outline">
          Generate Keypair
        </Button>
        <Button onClick={handleCreateNFT} variant="outline">
          Create and Mint NFT
        </Button>
        <Button onClick={handleMintTokens} variant="outline">
          Mint Tokens
        </Button>
        <Button onClick={handleSwapTokens} variant="outline">
          Swap Tokens
        </Button>
        <Button onClick={handleCreateTransaction} variant="outline">
          Create Transaction
        </Button>
        <Button onClick={handleGetBalance} variant="outline">
          Get Balance
        </Button>
        <Button onClick={handleCreateBlink} variant="outline">
          Create Blink
        </Button>
        <Button onClick={handleSendBlink} variant="outline">
          Send Blink
        </Button>
        <Button onClick={handleMakeDonation} variant="outline">
          Make Donation
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        {newKeypair && (
          <div className="w-full p-4 bg-gray-100 rounded mb-4">
            <h3 className="font-bold">Generated Keypair:</h3>
            <p>Public Key: {newKeypair.publicKey.toBase58()}</p>
            <p className="truncate">Private Key: {JSON.stringify(Array.from(newKeypair.secretKey))}</p>
          </div>
        )}
        <div className="w-full p-4 bg-gray-100 rounded">
          <h3 className="font-bold">Token Metadata:</h3>
          <p>Name: {tokenMetadata.name}</p>
          <p>Symbol: {tokenMetadata.symbol}</p>
          <p>Description: {tokenMetadata.description}</p>
          <p>Logo URL: {tokenMetadata.logoUrl}</p>
          <p>Website: {tokenMetadata.website}</p>
          <p>Whitepaper: {tokenMetadata.whitepaper}</p>
        </div>
      </CardFooter>
    </Card>
  );
}