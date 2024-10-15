'use client'

import React, { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { MILTON_MINT, USDC_MINT, MILTON_DECIMALS, USDC_DECIMALS } from '@/lib/solana/config'
import { createTransferInstruction } from '@solana/spl-token'
import { useUser } from '@/lib/auth/user-provider'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react'

export default function SolanaPay() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const { user } = useUser()
  const [amount, setAmount] = useState('')
  const [token, setToken] = useState('MILTON')
  const [isLoading, setIsLoading] = useState(false)

  const handlePayment = async () => {
    if (!publicKey || !user) {
      toast({
        title: "Error",
        description: "Please connect your wallet and sign in to make a payment.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const parsedAmount = parseFloat(amount)
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error("Invalid amount")
      }

      const mintPublicKey = token === 'MILTON' ? MILTON_MINT : USDC_MINT
      const decimals = token === 'MILTON' ? MILTON_DECIMALS : USDC_DECIMALS
      const tokenAmount = parsedAmount * Math.pow(10, decimals)

      const toPublicKey = new PublicKey(user.walletAddress) // Assuming user object has a walletAddress field

      const transaction = new Transaction()

      if (token === 'SOL') {
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: toPublicKey,
            lamports: tokenAmount,
          })
        )
      } else {
        const fromTokenAccount = await connection.getTokenAccountsByOwner(publicKey, { mint: mintPublicKey })
        const toTokenAccount = await connection.getTokenAccountsByOwner(toPublicKey, { mint: mintPublicKey })

        if (fromTokenAccount.value.length === 0 || toTokenAccount.value.length === 0) {
          throw new Error(`Token account not found for ${token}`)
        }

        transaction.add(
          createTransferInstruction(
            fromTokenAccount.value[0].pubkey,
            toTokenAccount.value[0].pubkey,
            publicKey,
            tokenAmount
          )
        )
      }

      const signature = await sendTransaction(transaction, connection)
      await connection.confirmTransaction(signature, 'confirmed')

      toast({
        title: "Payment Successful",
        description: `You have successfully sent ${amount} ${token} to your Milton account.`,
      })

      setAmount('')
    } catch (error) {
      console.error('Payment error:', error)
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Solana Pay</CardTitle>
        <CardDescription>Send tokens to your Milton account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="token">Token</Label>
          <Select value={token} onValueChange={setToken}>
            <SelectTrigger id="token">
              <SelectValue placeholder="Select token" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MILTON">MILTON</SelectItem>
              <SelectItem value="USDC">USDC</SelectItem>
              <SelectItem value="SOL">SOL</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handlePayment}
          disabled={isLoading || !publicKey || !user}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Send Payment'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}