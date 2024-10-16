'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Gift, Loader2 } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"
import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { transferTokens } from '@/lib/solana/token-utils'

const giftSchema = z.object({
  recipient: z.string().min(1, 'Recipient address is required'),
  amount: z.string().min(1, 'Amount is required').refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Amount must be a positive number'),
  tokenMint: z.string().min(1, 'Token mint is required'),
  message: z.string().max(200, 'Message must be 200 characters or less').optional(),
})

interface GiftFormProps {
  isDarkMode: boolean
  wallet: any
  fetchTokenBalances: () => Promise<void>
  fetchTransactionHistory: () => Promise<void>
}

export function GiftForm({
  isDarkMode,
  wallet,
  fetchTokenBalances,
  fetchTransactionHistory
}: GiftFormProps) {
  const { connection } = useConnection()
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(giftSchema)
  })

  const onSubmit = async (data) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to send a gift.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const signature = await transferTokens(
        connection,
        wallet,
        new PublicKey(data.recipient),
        parseFloat(data.amount),
        new PublicKey(data.tokenMint)
      )

      toast({
        title: "Gift Sent",
        description: `Your gift of ${data.amount} tokens has been sent. Transaction signature: ${signature}`,
      })

      if (data.message) {
        // Here you would typically store the message on-chain or in a database
        console.log('Gift message:', data.message)
      }

      reset()
      await fetchTokenBalances()
      await fetchTransactionHistory()
    } catch (error) {
      console.error('Error gifting tokens:', error)
      toast({
        title: "Gift Failed",
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
        <CardTitle className="flex items-center">
          <Gift className="mr-2 h-5 w-5" />
          Gift Tokens
        </CardTitle>
        <CardDescription>Send tokens as a gift to another wallet</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input 
              id="recipient" 
              {...register('recipient')} 
              placeholder="Enter recipient's Solana address"
              className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'}
            />
            {errors.recipient && <p className="text-red-500 text-sm mt-1">{errors.recipient.message}</p>}
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input 
              id="amount" 
              type="number" 
              step="0.000000001"
              {...register('amount')} 
              placeholder="Enter amount to gift"
              className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'}
            />
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>}
          </div>
          <div>
            <Label htmlFor="tokenMint">Token Mint</Label>
            <Input 
              id="tokenMint" 
              {...register('tokenMint')} 
              placeholder="Enter token mint address"
              className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'}
            />
            {errors.tokenMint && <p className="text-red-500 text-sm mt-1">{errors.tokenMint.message}</p>}
          </div>
          <div>
            <Label htmlFor="message">Gift Message (Optional)</Label>
            <Textarea 
              id="message" 
              {...register('message')} 
              placeholder="Enter a personal message (max 200 characters)"
              className={isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'}
            />
            {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
          </div>
          <Button 
            type="submit" 
            disabled={isLoading || !wallet.connected}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Gift...
              </>
            ) : (
              <>
                Send Gift
                <Gift className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}