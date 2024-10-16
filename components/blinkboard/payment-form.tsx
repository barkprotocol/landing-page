'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { transferTokens } from '@/lib/solana/utils'

const paymentSchema = z.object({
  recipient: z.string().min(1, 'Recipient address is required'),
  amount: z.string().min(1, 'Amount is required').refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Amount must be a positive number'),
  tokenMint: z.string().min(1, 'Token mint is required'),
})

interface PaymentFormProps {
  isDarkMode: boolean
  fetchTokenBalances: () => Promise<void>
  fetchTransactionHistory: () => Promise<void>
}

export function PaymentForm({ isDarkMode, fetchTokenBalances, fetchTransactionHistory }: PaymentFormProps) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(paymentSchema)
  })

  const onSubmit = async (data) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to make a payment.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const signature = await transferTokens(
        connection,
        wallet,
        data.recipient,
        parseFloat(data.amount),
        data.tokenMint
      )

      toast({
        title: "Payment Successful",
        description: `Transaction signature: ${signature}`,
      })

      reset()
      await fetchTokenBalances()
      await fetchTransactionHistory()
    } catch (error) {
      console.error('Error processing payment:', error)
      toast({
        title: "Payment Failed",
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
        <CardTitle>Make a Payment</CardTitle>
        <CardDescription>Send tokens to another wallet</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input id="recipient" {...register('recipient')} />
            {errors.recipient && <p className="text-red-500">{errors.recipient.message}</p>}
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" step="0.000000001" {...register('amount')} />
            {errors.amount && <p className="text-red-500">{errors.amount.message}</p>}
          </div>
          <div>
            <Label htmlFor="tokenMint">Token Mint</Label>
            <Input id="tokenMint" {...register('tokenMint')} />
            {errors.tokenMint && <p className="text-red-500">{errors.tokenMint.message}</p>}
          </div>
          <Button type="submit" disabled={isLoading || !wallet.connected}>
            {isLoading ? 'Processing...' : 'Send Payment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}