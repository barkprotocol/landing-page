import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'

const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com'
const connection = new Connection(SOLANA_RPC_URL, 'confirmed')

interface CreateTransactionParams {
  recipient: string
  amount: number
  token: string
}

export async function createTransaction({ recipient, amount, token }: CreateTransactionParams): Promise<Transaction> {
  const senderPublicKey = new PublicKey('...') // Replace with actual sender's public key
  const recipientPublicKey = new PublicKey(recipient)

  let transaction = new Transaction()

  if (token === 'SOL') {
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: senderPublicKey,
        toPubkey: recipientPublicKey,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    )
  } else {
    // For SPL tokens (including MILTON, BARK, USDC)
    const tokenPublicKey = new PublicKey('...') // Replace with actual token's public key
    const tokenAccount = new Token(connection, tokenPublicKey, TOKEN_PROGRAM_ID, senderPublicKey)

    const senderTokenAccount = await tokenAccount.getOrCreateAssociatedAccountInfo(senderPublicKey)
    const recipientTokenAccount = await tokenAccount.getOrCreateAssociatedAccountInfo(recipientPublicKey)

    transaction.add(
      Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        senderTokenAccount.address,
        recipientTokenAccount.address,
        senderPublicKey,
        [],
        amount * Math.pow(10, await tokenAccount.getMintInfo().then(info => info.decimals))
      )
    )
  }

  return transaction
}

export async function checkTransactionStatus(signature: string): Promise<'pending' | 'confirmed' | 'failed'> {
  try {
    const status = await connection.getSignatureStatus(signature)
    if (status.value?.confirmationStatus === 'finalized') {
      return 'confirmed'
    } else if (status.value?.confirmationStatus === 'processed') {
      return 'pending'
    } else {
      return 'failed'
    }
  } catch (error) {
    console.error('Error checking transaction status:', error)
    throw error
  }
}