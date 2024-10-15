// lib/solana/solana.ts

import {
    Connection,
    PublicKey,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction,
    Keypair,
  } from '@solana/web3.js';
  
  // You may need to configure your RPC URL
  const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  
  // Function to create a new keypair
  export function createKeypair() {
    return Keypair.generate();
  }
  
  // Function to send SOL to a recipient
  export async function sendSol(recipient: string, amount: number, payer: Keypair) {
    const recipientPublicKey = new PublicKey(recipient);
  
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: recipientPublicKey,
        lamports: amount * 1e9, // Convert SOL to lamports
      })
    );
  
    try {
      const signature = await sendAndConfirmTransaction(connection, transaction, {
        signers: [payer],
      });
      return { success: true, signature };
    } catch (error) {
      console.error('Error sending SOL:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Function to check the balance of a wallet
  export async function getBalance(publicKey: string) {
    try {
      const balance = await connection.getBalance(new PublicKey(publicKey));
      return { success: true, balance: balance / 1e9 }; // Convert lamports to SOL
    } catch (error) {
      console.error('Error fetching balance:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Function to mint an NFT (simple example, needs specific NFT program)
  export async function mintNFT(metadataUri: string, payer: Keypair) {
    // Logic to mint an NFT
    // This should interact with a specific NFT program (like Metaplex)
    // Placeholder for the actual minting logic
    
    try {
      // Assume we have a function mintNFTLogic to handle the minting process
      const mintResult = await mintNFTLogic(metadataUri, payer); // Placeholder function
      return { success: true, mintResult };
    } catch (error) {
      console.error('Error minting NFT:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Placeholder function for minting NFT logic
  async function mintNFTLogic(metadataUri: string, payer: Keypair) {
    // Implement the logic to mint an NFT with the specific NFT program here
    return {}; // Replace with actual minting result
  }
  