import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Button } from "@/components/ui/button"
import { useState } from 'react'
import { toast } from "@/components/ui/use-toast"

const SOLANA_NETWORK = 'devnet'
const SOLANA_RPC_URL = 'https://api.devnet.solana.com'

export default function SolanaTransaction() {
  const { publicKey, signTransaction } = useWallet()
  const [isLoading, setIsLoading] = useState(false)

  const handleTransaction = async () => {
    if (!publicKey || !signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to make a transaction.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const connection = new Connection(SOLANA_RPC_URL, 'confirmed')

      const recipientPubkey = new PublicKey('INSERT_RECIPIENT_PUBLIC_KEY_HERE') // Update with a valid recipient address

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports: 0.1 * LAMPORTS_PER_SOL, // Sending 0.1 SOL
        })
      )

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      const signedTransaction = await signTransaction(transaction)
      const txid = await connection.sendRawTransaction(signedTransaction.serialize())

      await connection.confirmTransaction({
        signature: txid,
        blockhash,
        lastValidBlockHeight,
      })

      toast({
        title: "Transaction Successful",
        description: `Transaction ID: ${txid}`,
      })
    } catch (error) {
      console.error('Transaction Error:', error)
      toast({
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleTransaction} disabled={!publicKey || isLoading}>
      {isLoading ? 'Processing...' : 'Send Transaction'}
    </Button>
  )
}
