import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart } from 'lucide-react'

const donateSchema = z.object({
  amount: z.string().min(1, 'Amount is required').refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Amount must be a positive number'),
  recipient: z.string().min(1, 'Recipient address is required'),
  message: z.string().optional(),
})

interface DonateFormProps {
  isDarkMode: boolean
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  wallet: any
  fetchTokenBalances: () => Promise<void>
  fetchTransactionHistory: () => 

 Promise<void>
}

export function DonateForm({
  isDarkMode,
  isLoading,
  setIsLoading,
  wallet,
  fetchTokenBalances,
  fetchTransactionHistory
}: DonateFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(donateSchema)
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    // Implement donation logic here
    console.log('Donating:', data)
    await fetchTokenBalances()
    await fetchTransactionHistory()
    setIsLoading(false)
  }

  return (
    <Card className={isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}>
      <CardHeader>
        <CardTitle>Make a Donation</CardTitle>
        <CardDescription>Support a cause with your tokens</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" {...register('amount')} />
            {errors.amount && <p className="text-red-500">{errors.amount.message}</p>}
          </div>
          <div>
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input id="recipient" {...register('recipient')} />
            {errors.recipient && <p className="text-red-500">{errors.recipient.message}</p>}
          </div>
          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea id="message" {...register('message')} />
          </div>
          <Button type="submit" disabled={isLoading || !wallet.connected}>
            {isLoading ? 'Donating...' : 'Donate'}
            <Heart className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}