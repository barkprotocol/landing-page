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

const nftSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  image: z.instanceof(File).refine((file) => file.size <= 5000000, `Max file size is 5MB.`),
})

export default function GenerateNFTPage() {
  const [isLoading, setIsLoading] = useState(false)
  const wallet = useWallet()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(nftSchema)
  })

  const onSubmit = async (data) => {
    if (!wallet.connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to generate an NFT.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Implement NFT generation logic here
      console.log('Generating NFT:', data)
      toast({
        title: "NFT Generated",
        description: "Your NFT has been successfully created!",
      })
    } catch (error) {
      console.error('Error generating NFT:', error)
      toast({
        title: "Error",
        description: "Failed to generate NFT. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Generate NFT</CardTitle>
        <CardDescription>Create a unique digital asset on the Solana blockchain</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">NFT Name</label>
            <Input id="name" {...register('name')} className="mt-1" />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <Textarea id="description" {...register('description')} className="mt-1" />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">Upload Image</label>
            <Input id="image" type="file" accept="image/*" {...register('image')} className="mt-1" />
            {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>}
          </div>
          <Button type="submit" disabled={isLoading || !wallet.connected} className="w-full">
            {isLoading ? 'Generating...' : 'Generate NFT'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}