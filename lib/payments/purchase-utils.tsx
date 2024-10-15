import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { createTransferInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token'

const CONTRACT_ADDRESS = "4DsZctdxSVNLGYB5YtY8A8JDg6tUoSZnQHSamXecKWWf"
const USDC_MINT_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" // Solana USDC mint address
const SOLANA_NETWORK = 'devnet' // Change to 'mainnet-beta' for production

export async function processPurchase(
  publicKey: PublicKey,
  signTransaction: (transaction: Transaction) => Promise<Transaction>,
  paymentMethod: 'SOL' | 'USDC',
  paymentAmount: number,
  setProgress: (progress: number) => void
) {
  const connection = new Connection(
    SOLANA_NETWORK === 'devnet' ? 'https://api.devnet.solana.com' : 'https://api.mainnet-beta.solana.com'
  )

  // Create a new transaction
  const transaction = new Transaction()

  if (paymentMethod === 'SOL') {
    // Add an instruction to transfer SOL from the buyer to the contract address
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(CONTRACT_ADDRESS),
        lamports: Math.floor(paymentAmount * LAMPORTS_PER_SOL)
      })
    )
  } else {
    // USDC transfer
    const usdcMint = new PublicKey(USDC_MINT_ADDRESS)
    const fromTokenAccount = await getAssociatedTokenAddress(usdcMint, publicKey)
    const toTokenAccount = await getAssociatedTokenAddress(usdcMint, new PublicKey(CONTRACT_ADDRESS))

    transaction.add(
      createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        publicKey,
        Math.floor(paymentAmount * 1000000), // USDC has 6 decimals
        [],
        TOKEN_PROGRAM_ID
      )
    )
  }

  // Set a recent blockhash
  const { blockhash } = await connection.getRecentBlockhash()
  transaction.recentBlockhash = blockhash
  transaction.feePayer = publicKey

  // Sign the transaction
  const signedTransaction = await signTransaction(transaction)

  // Send the transaction
  const txid = await connection.sendRawTransaction(signedTransaction.serialize())

  // Wait for confirmation
  const confirmation = await connection.confirmTransaction(txid)

  if (confirmation.value.err) {
    throw new Error("Transaction failed")
  }

  // Simulate progress
  const interval = setInterval(() => {
    setProgress((oldProgress) => {
      const newProgress = oldProgress + 10
      if (newProgress === 100) {
        clearInterval(interval)
      }
      return newProgress
    })
  }, 500)

  return txid
}