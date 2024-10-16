'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { useWallet } from '@solana/wallet-adapter-react'

const tokenSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  symbol: z.string().min(1, 'Symbol is required').max(5, 'Symbol must be 5 characters or less'),
  decimals: z.number().int().min(0).max(9),
  totalSupply: z.number().positive(),
  description: z.string().optional(),
})

export default function GenerateTokenPage() {
  const [isLoading, setIsLoading] = useState(false)
  const wallet = useWallet()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(tokenSchema)
  })

  const onSubmit = async (data) => {
    if (!wallet.connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to generate a token.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Implement token generation logic here
      console.log('Generating Token:', data)
      toast({
        title: "Token Generated",
        description: "Your token has been successfully created!",
      })
    } catch (error) {
      console.error('Error generating token:', error)
      toast({
        title: "Error",
        description: "Failed to generate token. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Generate Token</CardTitle>
        <CardDescription>Create a new token on the Solana blockchain</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Token Name</label>
            <Input id="name" {...register('name')} className="mt-1" />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="symbol" className="block text-sm font-medium text-gray-700">Token Symbol</label>
            <Input id="symbol" {...register('symbol')} className="mt-1" />
            {errors.symbol && <p className="mt-1 text-sm text-red-600">{errors.symbol.message}</p>}
          </div>
          <div>
            <label htmlFor="decimals" className="block text-sm font-medium text-gray-700">Decimals</label>
            <Input id="decimals" type="number" {...register('decimals', { valueAsNumber: true })} className="mt-1" />
            {errors.decimals && <p className="mt-1 text-sm text-red-600">{errors.decimals.message}</p>}
          </div>
          <div>
            <label htmlFor="totalSupply" className="block text-sm font-medium text-gray-700">Total Supply</label>
            <Input id="totalSupply" type="number" {...register('totalSupply', { valueAsNumber: true })} className="mt-1" />
            {errors.totalSupply && <p className="mt-1 text-sm text-red-600">{errors.totalSupply.message}</p>}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
            <Textarea id="description" {...register('description')} className="mt-1" />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>
          <Button type="submit" disabled={isLoading || !wallet.connected} className="w-full">
            {isLoading ? 'Generating...' : 'Generate Token'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}