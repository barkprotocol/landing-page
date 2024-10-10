import { Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, Keypair } from '@solana/web3.js'
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { CustomError, ErrorType } from '../custom-error'

const connection = new Connection(process.env.SOLANA_RPC_URL!, 'confirmed')

export async function createSolanaWallet(): Promise<{ publicKey: string; privateKey: string }> {
  const keypair = Keypair.generate()
  return {
    publicKey: keypair.publicKey.toBase58(),
    privateKey: Buffer.from(keypair.secretKey).toString('base64'),
  }
}

export async function getSolanaBalance(publicKey: string): Promise<number> {
  try {
    const balance = await connection.getBalance(new PublicKey(publicKey))
    return balance / 1e9 // Convert lamports to SOL
  } catch (error) {
    throw new CustomError(ErrorType.SolanaError, 'Failed to get Solana balance')
  }
}

export async function transferSOL(
  fromPrivateKey: string,
  toPublicKey: string,
  amount: number
): Promise<string> {
  try {
    const fromKeypair = Keypair.fromSecretKey(Buffer.from(fromPrivateKey, 'base64'))
    const toPublicKeyObj = new PublicKey(toPublicKey)

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromKeypair.publicKey,
        toPubkey: toPublicKeyObj,
        lamports: amount * 1e9, // Convert SOL to lamports
      })
    )

    const signature = await sendAndConfirmTransaction(connection, transaction, [fromKeypair])
    return signature
  } catch (error) {
    throw new CustomError(ErrorType.SolanaError, 'Failed to transfer SOL')
  }
}

export async function createTokenAccount(
  tokenMint: PublicKey,
  owner: PublicKey
): Promise<PublicKey> {
  try {
    const token = new Token(connection, tokenMint, TOKEN_PROGRAM_ID, Keypair.generate())
    return await token.getOrCreateAssociatedAccountInfo(owner)
  } catch (error) {
    throw new CustomError(ErrorType.SolanaError, 'Failed to create token account')
  }
}

export async function transferToken(
  tokenMint: PublicKey,
  fromPrivateKey: string,
  toPublicKey: string,
  amount: number
): Promise<string> {
  try {
    const fromKeypair = Keypair.fromSecretKey(Buffer.from(fromPrivateKey, 'base64'))
    const toPublicKeyObj = new PublicKey(toPublicKey)

    const token = new Token(connection, tokenMint, TOKEN_PROGRAM_ID, fromKeypair)
    const fromTokenAccount = await token.getOrCreateAssociatedAccountInfo(fromKeypair.publicKey)
    const toTokenAccount = await token.getOrCreateAssociatedAccountInfo(toPublicKeyObj)

    const transaction = new Transaction().add(
      Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        fromTokenAccount.address,
        toTokenAccount.address,
        fromKeypair.publicKey,
        [],
        amount
      )
    )

    const signature = await sendAndConfirmTransaction(connection, transaction, [fromKeypair])
    return signature
  } catch (error) {
    throw new CustomError(ErrorType.SolanaError, 'Failed to transfer token')
  }
}