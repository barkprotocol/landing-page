import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from 'lucide-react'

const createTokenSchema = z.object({
  name: z.string().min(1, 'Token name is required'),
  symbol: z.string().min(1, 'Token symbol is required').max(5, 'Symbol must be 5 characters or less'),
  totalSupply: z.string().min(1, 'Total supply is required').refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Total supply must be a positive number'),
})

interface CreateFormProps {
  isDarkMode: boolean
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  wallet: any
  fetchTokenBalances: () => Promise<void>
  fetchTransactionHistory: () => Promise<void>
}

export function CreateForm({
  isDarkMode,
  isLoading,
  setIsLoading,
  wallet,
  fetchTokenBalances,
  fetchTransactionHistory
}: CreateFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(createTokenSchema)
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // Implement token creation logic here
      console.log('Creating token:', data)
      await fetchTokenBalances()
      await fetchTransactionHistory()
    } catch (error) {
      console.error('Error creating token:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}>
      <CardHeader>
        <CardTitle>Create Token</CardTitle>
        <CardDescription>Create a new token on the Solana blockchain</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Token Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="symbol">Token Symbol</Label>
            <Input id="symbol" {...register('symbol')} />
            {errors.symbol && <p className="text-red-500">{errors.symbol.message}</p>}
          </div>
          <div>
            <Label htmlFor="totalSupply">Total Supply</Label>
            <Input id="totalSupply" {...register('totalSupply')} />
            {errors.totalSupply && <p className="text-red-500">{errors.totalSupply.message}</p>}
          </div>
          <Button type="submit" disabled={isLoading || !wallet.connected}>
            {isLoading ? 'Creating Token...' : 'Create Token'}
            <Plus className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}