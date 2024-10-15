import {
  createSolanaWallet,
  getSolanaBalance,
  transferSOL,
  transferUSDC,
  createTokenAccount,
} from './lib/solana/solana';

async function main() {
  // Create a new wallet
  const wallet = createSolanaWallet();
  console.log('New Wallet:', wallet);

  // Get balance of the new wallet (should be 0 initially)
  const balance = await getSolanaBalance(wallet.publicKey);
  console.log('Initial SOL Balance:', balance);

  // Transfer SOL (assuming you have another wallet to send from)
  const transactionSignature = await transferSOL('fromPrivateKeyHere', wallet.publicKey, 0.01);
  console.log('Transfer SOL Signature:', transactionSignature);

  // Create a USDC token account for the new wallet
  const usdcAccount = await createTokenAccount(USDC_MINT_ADDRESS, new PublicKey(wallet.publicKey));
  console.log('Created USDC Account:', usdcAccount);

  // Transfer USDC to the new wallet (amount to be determined)
  const usdcTransactionSignature = await transferUSDC('fromPrivateKeyHere', wallet.publicKey, 100);
  console.log('Transfer USDC Signature:', usdcTransactionSignature);
}

main().catch(console.error);
