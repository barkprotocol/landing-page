import { 
    Connection, 
    PublicKey, 
    Transaction, 
    sendAndConfirmTransaction,
    TransactionSignature,
    Keypair
  } from '@solana/web3.js';
  import { 
    TOKEN_PROGRAM_ID, 
    getAssociatedTokenAddress, 
    getAccount,
    createAssociatedTokenAccountInstruction,
    createTransferInstruction,
    TokenAccountNotFoundError,
    TokenInvalidAccountOwnerError
  } from '@solana/spl-token';
  
  interface Wallet {
    publicKey: PublicKey;
    signTransaction: (transaction: Transaction) => Promise<Transaction>;
  }
  
  export async function transferTokens(
    connection: Connection,
    wallet: Wallet,
    recipient: string,
    amount: number,
    tokenMint: string
  ): Promise<TransactionSignature> {
    try {
      const recipientPubkey = new PublicKey(recipient);
      const tokenMintPubkey = new PublicKey(tokenMint);
  
      const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet,
        tokenMintPubkey,
        wallet.publicKey
      );
  
      const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet,
        tokenMintPubkey,
        recipientPubkey
      );
  
      const transaction = new Transaction().add(
        createTransferInstruction(
          fromTokenAccount.address,
          toTokenAccount.address,
          wallet.publicKey,
          amount,
          [],
          TOKEN_PROGRAM_ID
        )
      );
  
      const signature = await sendAndConfirmTransaction(
        connection, 
        transaction, 
        [wallet as any] // Type assertion needed due to wallet interface mismatch
      );
      
      return signature;
    } catch (error) {
      console.error('Error in transferTokens:', error);
      throw error;
    }
  }
  
  export async function getOrCreateAssociatedTokenAccount(
    connection: Connection,
    wallet: Wallet,
    mint: PublicKey,
    owner: PublicKey
  ) {
    try {
      const associatedToken = await getAssociatedTokenAddress(mint, owner);
      
      try {
        return await getAccount(connection, associatedToken);
      } catch (error) {
        if (
          error instanceof TokenAccountNotFoundError ||
          error instanceof TokenInvalidAccountOwnerError
        ) {
          // Account does not exist or is invalid, proceed to create it
        } else {
          throw error;
        }
      }
  
      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedToken,
          owner,
          mint
        )
      );
  
      const blockHash = await connection.getRecentBlockhash();
      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = blockHash.blockhash;
      const signed = await wallet.signTransaction(transaction);
  
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);
  
      return await getAccount(connection, associatedToken);
    } catch (error) {
      console.error('Error in getOrCreateAssociatedTokenAccount:', error);
      throw error;
    }
  }
  
  // Helper function to create a new wallet (for testing purposes)
  export function createNewWallet(): Wallet {
    const keypair = Keypair.generate();
    return {
      publicKey: keypair.publicKey,
      signTransaction: async (transaction: Transaction) => {
        transaction.partialSign(keypair);
        return transaction;
      },
    };
  }