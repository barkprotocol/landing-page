import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageIcon } from 'lucide-react'

const createNFTSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  image: z.instanceof(File).refine((file) => file.size <= 5000000, `Max file size is 5MB.`),
})

interface CreateNFTFormProps {
  isDarkMode: boolean
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  wallet: any
  fetchNFTGallery: () => Promise<void>
}

export function CreateNFTForm({
  isDarkMode,
  isLoading,
  setIsLoading,
  wallet,
  fetchNFTGallery
}: CreateNFTFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(createNFTSchema)
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    // Implement NFT creation logic here
    console.log('Creating NFT:', data)
    await fetchNFTGallery()
    setIsLoading(false)
  }

  return (
    <Card className={isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}>
      <CardHeader>
        <CardTitle>Create NFT</CardTitle>
        <CardDescription>Mint a new NFT on the blockchain</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">NFT Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} />
            {errors.description && <p className="text-red-500">{errors.description.message}</p>}
          </div>
          <div>
            <Label htmlFor="image">Upload Image</Label>
            <Input id="image" type="file" accept="image/*" {...register('image')} />
            {errors.image && <p className="text-red-500">{errors.image.message}</p>}
          </div>
          <Button type="submit" disabled={isLoading || !wallet.connected}>
            {isLoading ? 'Creating...' : 'Create NFT'}
            <ImageIcon className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}