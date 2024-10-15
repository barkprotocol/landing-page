import { NextResponse } from 'next/server';
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  sendAndConfirmTransaction,
  Keypair,
} from '@solana/web3.js';
import { Metaplex, bundlrStorage, toMetaplexFile } from '@metaplex-foundation/js';
import { Jupiter } from '@jup-ag/api';
import { TokenListProvider, TokenInfo } from '@solana/spl-token-registry';
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import fs from 'fs';
import path from 'path';
import { getMarketPrices } from './market-prices';

// Establish a connection to the Solana blockchain
const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
);
const metaplex = Metaplex.make(connection).use(bundlrStorage());

// Load the Blink program ID and IDL
const BLINK_PROGRAM_ID = new PublicKey(process.env.BLINK_PROGRAM_ID || '');
const idl = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, './blink_idl.json'), 'utf8')
);
const program = new Program(idl, BLINK_PROGRAM_ID, { connection });

// Handle GET requests
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'market-prices':
      return getMarketPrices(connection);
    case 'token-list':
      return getTokenList();
    case 'account-info':
      const pubkey = searchParams.get('pubkey');
      if (!pubkey) return NextResponse.json({ error: 'Missing pubkey parameter' }, { status: 400 });
      return getAccountInfo(pubkey);
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}

// Handle POST requests
export async function POST(request: Request) {
  const body = await request.json();
  const { action } = body;

  switch (action) {
    case 'send':
      return sendTransaction(body);
    case 'send-gift':
      return sendGift(body);
    case 'swap':
      return swapTokens(body);
    case 'create-blink':
      return createBlink(body);
    case 'create-payment':
      return createPayment(body);
    case 'create-nft':
      return createNFT(body);
    case 'donate':
      return donate(body);
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}

// Fetch the token list
async function getTokenList() {
  try {
    const tokenList = await new TokenListProvider().resolve();
    const filteredList = tokenList.filterByClusterSlug('mainnet-beta').getList();
    return NextResponse.json(filteredList);
  } catch (error) {
    console.error('Error fetching token list:', error);
    return NextResponse.json({ error: 'Failed to fetch token list' }, { status: 500 });
  }
}

// Fetch account info
async function getAccountInfo(pubkey: string) {
  try {
    const account = await connection.getAccountInfo(new PublicKey(pubkey));
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    return NextResponse.json({
      balance: account.lamports / LAMPORTS_PER_SOL,
      owner: account.owner.toBase58(),
      executable: account.executable,
      rentEpoch: account.rentEpoch,
    });
  } catch (error) {
    console.error('Error fetching account info:', error);
    return NextResponse.json({ error: 'Failed to fetch account info' }, { status: 500 });
  }
}

// Send a transaction
async function sendTransaction({ amount, recipient, memo, selectedToken, fee }) {
  try {
    const senderKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.SENDER_PRIVATE_KEY || '[]')));
    const recipientPubkey = new PublicKey(recipient);

    let transaction = new Transaction();

    // Check if the selected token is SOL
    if (selectedToken === 'SOL') {
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: senderKeypair.publicKey,
          toPubkey: recipientPubkey,
          lamports: LAMPORTS_PER_SOL * parseFloat(amount),
        })
      );
    } else {
      const mint = new PublicKey(selectedToken);
      const senderATA = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint,
        senderKeypair.publicKey
      );
      const recipientATA = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint,
        recipientPubkey
      );

      transaction.add(
        Token.createTransferInstruction(
          TOKEN_PROGRAM_ID,
          senderATA,
          recipientATA,
          senderKeypair.publicKey,
          [],
          parseFloat(amount) * Math.pow(10, 9) // Assuming 9 decimals for the token
        )
      );
    }

    // Add a memo to the transaction if provided
    if (memo) {
      transaction.add(
        new TransactionInstruction({
          keys: [],
          programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
          data: Buffer.from(memo, 'utf8'),
        })
      );
    }

    // Send and confirm the transaction
    const signature = await sendAndConfirmTransaction(connection, transaction, [senderKeypair]);

    return NextResponse.json({ message: 'Transaction sent successfully', signature });
  } catch (error) {
    console.error('Error sending transaction:', error);
    return NextResponse.json({ error: 'Failed to send transaction' }, { status: 500 });
  }
}

// Send a gift transaction
async function sendGift({ amount, recipient, giftMessage, selectedToken, fee }) {
  try {
    const result = await sendTransaction({ amount, recipient, memo: giftMessage, selectedToken, fee });
    const data = await result.json();
    return NextResponse.json({ ...data, message: 'Gift sent successfully' });
  } catch (error) {
    console.error('Error sending gift:', error);
    return NextResponse.json({ error: 'Failed to send gift' }, { status: 500 });
  }
}

// Swap tokens
async function swapTokens({ swapFrom, swapTo, swapAmount, fee }) {
  try {
    const jupiter = await Jupiter.load({
      connection,
      cluster: 'mainnet-beta',
      user: Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.SENDER_PRIVATE_KEY || '[]'))),
    });

    const routes = await jupiter.computeRoutes({
      inputMint: new PublicKey(swapFrom),
      outputMint: new PublicKey(swapTo),
      amount: LAMPORTS_PER_SOL * parseFloat(swapAmount),
      slippageBps: 50,
    });

    const { execute } = await jupiter.exchange({
      routeInfo: routes.routesInfos[0],
    });

    const swapResult = await execute();

    if ('txid' in swapResult) {
      return NextResponse.json({ message: 'Swap executed successfully', txid: swapResult.txid });
    } else {
      return NextResponse.json({ error: 'Swap failed', reason: swapResult.error }, { status: 500 });
    }
  } catch (error) {
    console.error('Error executing swap:', error);
    return NextResponse.json({ error: 'Failed to execute swap' }, { status: 500 });
  }
}

// Create a Blink
async function createBlink({ blinkName, blinkDescription }) {
  try {
    const blinkAccount = anchor.web3.Keypair.generate();
    const senderKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.SENDER_PRIVATE_KEY || '[]')));

    await program.rpc.createBlink(blinkName, blinkDescription, {
      accounts: {
        blink: blinkAccount.publicKey,
        user: senderKeypair.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [senderKeypair, blinkAccount],
    });

    return NextResponse.json({ message: 'Blink created successfully', blinkAddress: blinkAccount.publicKey.toBase58() });
  } catch (error) {
    console.error('Error creating Blink:', error);
    return NextResponse.json({ error: 'Failed to create Blink' }, { status: 500 });
  }
}

// Create a payment
async function createPayment({ paymentAmount, paymentDescription, selectedToken, fee }) {
  try {
    const paymentAccount = anchor.web3.Keypair.generate();
    const senderKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.SENDER_PRIVATE_KEY || '[]')));

    await program.rpc.createPayment(new anchor.BN(paymentAmount), paymentDescription, new PublicKey(selectedToken), {
      accounts: {
        payment: paymentAccount.publicKey,
        user: senderKeypair.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [senderKeypair, paymentAccount],
    });

    return NextResponse.json({ message: 'Payment created successfully', paymentAddress: paymentAccount.publicKey.toBase58() });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}

// Create an NFT
async function createNFT({ metadata }) {
  try {
    const { image, name, description, seller_fee_basis_points } = metadata;
    const imageFile = toMetaplexFile(image, 'image.png');
    const { uri } = await metaplex.nfts().uploadMetadata({
      name,
      description,
      image: imageFile,
      seller_fee_basis_points,
    });

    const nftAccount = await metaplex.nfts().create({
      uri,
      owner: Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.SENDER_PRIVATE_KEY || '[]'))),
    });

    return NextResponse.json({ message: 'NFT created successfully', nftAddress: nftAccount.address.toBase58() });
  } catch (error) {
    console.error('Error creating NFT:', error);
    return NextResponse.json({ error: 'Failed to create NFT' }, { status: 500 });
  }
}

// Donate to a cause
async function donate({ amount, recipient, donationMessage }) {
  try {
    const result = await sendTransaction({ amount, recipient, memo: donationMessage, selectedToken: 'SOL' });
    const data = await result.json();
    return NextResponse.json({ ...data, message: 'Donation sent successfully' });
  } catch (error) {
    console.error('Error sending donation:', error);
    return NextResponse.json({ error: 'Failed to send donation' }, { status: 500 });
  }
}
