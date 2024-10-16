import { NextRequest, NextResponse } from 'next/server'
import { Connection, Keypair, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getOrCreateAssociatedTokenAccount, createTransferInstruction, getMint } from '@solana/spl-token'
import { z } from 'zod'

const SOLANA_RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'devnet' 
  ? 'https://api.devnet.solana.com' 
  : 'https://api.mainnet-beta.solana.com'
const MILTON_TOKEN_MINT = process.env.MILTON_TOKEN_MINT
const USDC_TOKEN_MINT = process.env.USDC_TOKEN_MINT
const AUTHORITY_PRIVATE_KEY = process.env.AUTHORITY_PRIVATE_KEY
const MAX_TRANSACTION_AMOUNT = 1000 // Maximum transaction amount in SOL or tokens

if (!MILTON_TOKEN_MINT || !USDC_TOKEN_MINT || !AUTHORITY_PRIVATE_KEY) {
  throw new Error('Required environment variables are not set')
}

const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed')
const authorityKeypair = Keypair.fromSecretKey(new Uint8Array(JSON.parse(AUTHORITY_PRIVATE_KEY)))

const CreateTransactionSchema = z.object({
  senderAddress: z.string().refine(
    (value) => {
      try {
        new PublicKey(value)
        return true
      } catch {
        return false
      }
    },
    {
      message: 'Invalid sender public key',
    }
  ),
  recipientAddress: z.string().refine(
    (value) => {
      try {
        new PublicKey(value)
        return true
      } catch {
        return false
      }
    },
    {
      message: 'Invalid recipient public key',
    }
  ),
  amount: z.number().positive().max(MAX_TRANSACTION_AMOUNT),
  transactionType: z.enum(['SOL', 'MILTON', 'USDC']),
})

const SubmitTransactionSchema = z.object({
  signedTransaction: z.string(),
})

export async function POST(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.endsWith('/create')) {
    return handleCreateTransaction(request)
  } else if (pathname.endsWith('/submit')) {
    return handleSubmitTransaction(request)
  } else {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 })
  }
}

async function handleCreateTransaction(request: NextRequest) {
  try {
    const body = await request.json()
    const { senderAddress, recipientAddress, amount, transactionType } = CreateTransactionSchema.parse(body)

    const senderPublicKey = new PublicKey(senderAddress)
    const recipientPublicKey = new PublicKey(recipientAddress)

    let transaction: Transaction

    if (transactionType === 'SOL') {
      transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: senderPublicKey,
          toPubkey: recipientPublicKey,
          lamports: Math.round(amount * LAMPORTS_PER_SOL),
        })
      )
    } else {
      const tokenMint = new PublicKey(transactionType === 'MILTON' ? MILTON_TOKEN_MINT : USDC_TOKEN_MINT)
      const mintInfo = await getMint(connection, tokenMint)
      const tokenAmount = Math.round(amount * Math.pow(10, mintInfo.decimals))

      const senderATA = await getOrCreateAssociatedTokenAccount(
        connection,
        authorityKeypair,
        tokenMint,
        senderPublicKey
      )

      const recipientATA = await getOrCreateAssociatedTokenAccount(
        connection,
        authorityKeypair,
        tokenMint,
        recipientPublicKey
      )

      transaction = new Transaction().add(
        createTransferInstruction(
          senderATA.address,
          recipientATA.address,
          senderPublicKey,
          tokenAmount
        )
      )
    }

    transaction.feePayer = senderPublicKey
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.lastValidBlockHeight = lastValidBlockHeight

    const serializedTransaction = transaction.serialize({ requireAllSignatures: false })
    const base64Transaction = serializedTransaction.toString('base64')

    return NextResponse.json({
      success: true,
      transaction: base64Transaction,
      lastValidBlockHeight,
      message: `Transaction created successfully. Please sign and submit the transaction.`,
    })
  } catch (error) {
    console.error('Create transaction error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

async function handleSubmitTransaction(request: NextRequest) {
  try {
    const body = await request.json()
    const { signedTransaction } = SubmitTransactionSchema.parse(body)

    const transaction = Transaction.from(Buffer.from(signedTransaction, 'base64'))

    const signature = await sendAndConfirmTransaction(connection, transaction, [authorityKeypair])

    return NextResponse.json({
      success: true,
      signature,
      message: `Transaction submitted successfully. Signature: ${signature}`,
    })
  } catch (error) {
    console.error('Submit transaction error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const signature = request.nextUrl.searchParams.get('signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature parameter' }, { status: 400 })
  }

  try {
    const transaction = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    return NextResponse.json({
      signature,
      blockTime: transaction.blockTime,
      slot: transaction.slot,
      confirmations: transaction.confirmations,
      err: transaction.meta?.err,
    })
  } catch (error) {
    console.error('Get transaction error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}