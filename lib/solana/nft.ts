import {
    Connection,
    Keypair,
    PublicKey,
    Transaction,
    SystemProgram,
    LAMPORTS_PER_SOL,
    sendAndConfirmTransaction,
  } from '@solana/web3.js';
  import {
    createMint,
    mintTo,
    createMetadata,
    findMetadataAccount,
  } from './nft-utils'; // Adjust based on your utility functions
  import { getKeypair } from './keypairs'; // Function to retrieve the Keypair for signing transactions
  
  // Function to mint an NFT
  export async function mintNFT(
    { name, description, image, metadata }: { name: string; description: string; image: string; metadata: any },
    userId: string
  ) {
    try {
      // Connect to the Solana network
      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL, 'confirmed');
  
      // Get the user's keypair for signing the transaction
      const userKeypair = await getKeypair(userId);
      if (!userKeypair) {
        return { error: 'User keypair not found' };
      }
  
      // Mint the NFT using the utility function
      const mintResult = await mintNFTOnSolana({
        connection,
        userKeypair,
        name,
        description,
        image,
        metadata,
      });
  
      if (mintResult.error) {
        return { error: mintResult.error };
      }
  
      // Return the transaction ID and any other relevant data
      return {
        transactionId: mintResult.transactionId,
        mintAddress: mintResult.mintAddress,
      };
    } catch (error) {
      console.error('Error minting NFT:', error);
      return { error: 'Minting failed' };
    }
  }
  
  // Utility function to mint NFT on Solana
  async function mintNFTOnSolana({
    connection,
    userKeypair,
    name,
    description,
    image,
    metadata,
  }: {
    connection: Connection;
    userKeypair: Keypair;
    name: string;
    description: string;
    image: string;
    metadata: any;
  }) {
    try {
      // Create the mint account
      const mintAddress = await createMint(connection, userKeypair);
  
      // Create metadata for the NFT
      await createMetadata(connection, userKeypair, mintAddress, {
        name,
        symbol: '',
        uri: image, // Change this to the URI of your metadata if needed
        sellerFeeBasisPoints: 500, // Example: 5% fee
        creators: null,
      });
  
      // Mint the NFT to the user's wallet
      await mintTo(connection, userKeypair, mintAddress, userKeypair.publicKey, 1);
  
      // Return success data
      const metadataAccount = await findMetadataAccount(mintAddress);
      return {
        transactionId: metadataAccount.toString(), // Example: using the metadata account address as transaction ID
        mintAddress: mintAddress.toString(),
      };
    } catch (error) {
      console.error('Error during NFT minting:', error);
      return { error: 'Failed to mint NFT on Solana' };
    }
  }
  