'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction } from '@solana/web3.js'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

const claimSchema = z.object({
  amount: z.string().min(1, 'Amount is required').refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Amount must be a positive number'),
})

interface ClaimFormProps {
  isDarkMode: boolean
  fetchTokenBalances: () => Promise<void>
}

export function ClaimForm({ isDarkMode, fetchTokenBalances }: ClaimFormProps) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(claimSchema)
  })

  const onSubmit = async (data) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to claim rewards.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // TODO: Implement the actual claim logic here
      // This is a placeholder for the actual Solana transaction
      const transaction = new Transaction()
      // Add instructions to the transaction here

      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = wallet.publicKey

      const signedTransaction = await wallet.signTransaction(transaction)
      const signature = await connection.sendRawTransaction(signedTransaction.serialize())

      await connection.confirmTransaction(signature)

      toast({
        title: "Claim Successful",
        description: `You have successfully claimed ${data.amount} tokens.`,
      })

      reset()
      await fetchTokenBalances()
    } catch (error) {
      console.error('Error claiming rewards:', error)
      toast({
        title: "Claim Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}>
      <CardHeader>
        <CardTitle>Claim Rewards</CardTitle>
        <CardDescription>Claim your earned rewards</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount to Claim</Label>
            <Input id="amount" type="number" step="0.000000001" {...register('amount')} />
            {errors.amount && <p className="text-red-500">{errors.amount.message}</p>}
          </div>
          <Button type="submit" disabled={isLoading || !wallet.connected}>
            {isLoading ? 'Claiming...' : 'Claim Rewards'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}