import {
    Connection,
    PublicKey,
    Transaction,
    SystemProgram,
    LAMPORTS_PER_SOL,
    sendAndConfirmTransaction,
    Keypair,
  } from '@solana/web3.js';
  import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
  import { SOLANA_RPC_ENDPOINT, MILTON_MINT, USDC_MINT, MILTON_DECIMALS, USDC_DECIMALS } from './config';
  
  const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');
  
  export async function getBalance(publicKey: PublicKey): Promise<number> {
    try {
      const balance = await connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting balance:', error);
      throw new Error('Failed to get balance');
    }
  }
  
  export async function transferSOL(
    from: Keypair,
    to: PublicKey,
    amount: number
  ): Promise<string> {
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: from.publicKey,
          toPubkey: to,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );
  
      const signature = await sendAndConfirmTransaction(connection, transaction, [from]);
      return signature;
    } catch (error) {
      console.error('Error transferring SOL:', error);
      throw new Error('Failed to transfer SOL');
    }
  }
  
  export async function getTokenBalance(
    owner: PublicKey,
    mint: PublicKey
  ): Promise<number> {
    try {
      const tokenAccount = await getAssociatedTokenAddress(mint, owner);
      const balance = await connection.getTokenAccountBalance(tokenAccount);
      const decimals = mint.equals(MILTON_MINT) ? MILTON_DECIMALS : USDC_DECIMALS;
      return parseFloat(balance.value.amount) / Math.pow(10, decimals);
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw new Error('Failed to get token balance');
    }
  }
  
  export async function createAssociatedTokenAccount(
    payer: Keypair,
    owner: PublicKey,
    mint: PublicKey
  ): Promise<PublicKey> {
    try {
      const associatedTokenAddress = await getAssociatedTokenAddress(mint, owner);
      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          payer.publicKey,
          associatedTokenAddress,
          owner,
          mint
        )
      );
  
      await sendAndConfirmTransaction(connection, transaction, [payer]);
      return associatedTokenAddress;
    } catch (error) {
      console.error('Error creating associated token account:', error);
      throw new Error('Failed to create associated token account');
    }
  }
  
  export async function transferToken(
    from: Keypair,
    to: PublicKey,
    mint: PublicKey,
    amount: number
  ): Promise<string> {
    try {
      const fromTokenAccount = await getAssociatedTokenAddress(mint, from.publicKey);
      const toTokenAccount = await getAssociatedTokenAddress(mint, to);
  
      const transaction = new Transaction();
  
      // Check if the recipient's token account exists
      const toTokenAccountInfo = await connection.getAccountInfo(toTokenAccount);
      if (!toTokenAccountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            from.publicKey,
            toTokenAccount,
            to,
            mint
          )
        );
      }
  
      const decimals = mint.equals(MILTON_MINT) ? MILTON_DECIMALS : USDC_DECIMALS;
      const tokenAmount = amount * Math.pow(10, decimals);
  
      transaction.add(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          from.publicKey,
          tokenAmount
        )
      );
  
      const signature = await sendAndConfirmTransaction(connection, transaction, [from]);
      return signature;
    } catch (error) {
      console.error('Error transferring token:', error);
      throw new Error('Failed to transfer token');
    }
  }
  
  function createTransferInstruction(
    source: PublicKey,
    destination: PublicKey,
    owner: PublicKey,
    amount: number
  ): TransactionInstruction {
    const data = Buffer.alloc(9);
    data.writeUInt8(3, 0); // Transfer instruction
    data.writeBigUInt64LE(BigInt(amount), 1);
  
    return new TransactionInstruction({
      keys: [
        { pubkey: source, isSigner: false, isWritable: true },
        { pubkey: destination, isSigner: false, isWritable: true },
        { pubkey: owner, isSigner: true, isWritable: false },
      ],
      programId: TOKEN_PROGRAM_ID,
      data,
    });
  }