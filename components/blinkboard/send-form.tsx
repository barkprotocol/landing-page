import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Send } from 'lucide-react'

const sendSchema = z.object({
  amount: z.string().min(1, 'Amount is required').refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Amount must be a positive number'),
  recipient: z.string().min(1, 'Recipient address is required'),
  memo: z.string().optional(),
})

interface SendFormProps {
  isDarkMode: boolean
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  wallet: any
  fetchTokenBalances: () => Promise<void>
  fetchTransactionHistory: () => Promise<void>
}

export function SendForm({
  isDarkMode,
  isLoading,
  setIsLoading,
  wallet,
  fetchTokenBalances,
  fetchTransactionHistory
}: SendFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(sendSchema)
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    // Implement send logic here
    console.log('Sending:', data)
    await fetchTokenBalances()
    await fetchTransactionHistory()
    setIsLoading(false)
  }

  return (
    <Card className={isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}>
      <CardHeader>
        <CardTitle>Send Tokens</CardTitle>
        <CardDescription>Send tokens to another wallet</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" {...register('amount')} />
            {errors.amount && <p className="text-red-500">{errors.amount.message}</p>}
          </div>
          <div>
            <Label htmlFor="recipient">Recipient</Label>
            <Input id="recipient" {...register('recipient')} />
            {errors.recipient && <p className="text-red-500">{errors.recipient.message}</p>}
          </div>
          <div>
            <Label htmlFor="memo">Memo (Optional)</Label>
            <Input id="memo" {...register('memo')} />
          </div>
          <Button type="submit" disabled={isLoading || !wallet.connected}>
            {isLoading ? 'Sending...' : 'Send'}
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}