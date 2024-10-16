"use client";

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shuffle } from 'lucide-react'

const swapSchema = z.object({
  fromAmount: z.string().min(1, 'Amount is required').refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Amount must be a positive number'),
  toAmount: z.string().min(1, 'Amount is required').refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Amount must be a positive number'),
})

interface SwapFormProps {
  isDarkMode: boolean
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  wallet: any
  fetchTokenBalances: () => Promise<void>
  fetchTransactionHistory: () => Promise<void>
}

export function SwapForm({
  isDarkMode,
  isLoading,
  setIsLoading,
  wallet,
  fetchTokenBalances,
  fetchTransactionHistory
}: SwapFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(swapSchema)
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    // Implement swap logic here
    console.log('Swapping:', data)
    await fetchTokenBalances()
    await fetchTransactionHistory()
    setIsLoading(false)
  }

  return (
    <Card className={isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}>
      <CardHeader>
        <CardTitle>Swap Tokens</CardTitle>
        <CardDescription>Exchange one token for another</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="fromAmount">From Amount</Label>
            <Input id="fromAmount" {...register('fromAmount')} />
            {errors.fromAmount && <p className="text-red-500">{errors.fromAmount.message}</p>}
          </div>
          <div>
            <Label htmlFor="toAmount">To Amount</Label>
            <Input id="toAmount" {...register('toAmount')} />
            {errors.toAmount && <p className="text-red-500">{errors.toAmount.message}</p>}
          </div>
          <Button type="submit" disabled={isLoading || !wallet.connected}>
            {isLoading ? 'Swapping...' : 'Swap'}
            <Shuffle className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}