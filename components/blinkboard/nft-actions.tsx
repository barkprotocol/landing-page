'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { mintNFT, transferNFT, burnNFT } from '@/lib/solana/nft-utils'

const mintSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  symbol: z.string().min(1, 'Symbol is required'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().url('Image must be a valid URL'),
})

const transferSchema = z.object({
  nftMint: z.string().min(1, 'NFT mint address is required'),
  recipient: z.string().min(1, 'Recipient address is required'),
})

const burnSchema = z.object({
  nftMint: z.string().min(1, 'NFT mint address is required'),
})

interface NFTActionsProps {
  isDarkMode: boolean
  fetchNFTGallery: () => Promise<void>
}

export function NFTActions({ isDarkMode, fetchNFTGallery }: NFTActionsProps) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [isLoading, setIsLoading] = useState(false)

  const mintForm = useForm({
    resolver: zodResolver(mintSchema)
  })

  const transferForm = useForm({
    resolver: zodResolver(transferSchema)
  })

  const burnForm = useForm({
    resolver: zodResolver(burnSchema)
  })

  const onMint = async (data) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to mint an NFT.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const nftAddress = await mintNFT(connection, wallet.publicKey, data)
      toast({
        title: "NFT Minted",
        description: `NFT minted with address: ${nftAddress}`,
      })
      mintForm.reset()
      await fetchNFTGallery()
    } catch (error) {
      console.error('Error minting NFT:', error)
      toast({
        title: "Minting Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onTransfer = async (data) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to transfer an NFT.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const signature = await transferNFT(
        connection,
        wallet.publicKey,
        new PublicKey(data.nftMint),
        new PublicKey(data.recipient)
      )
      toast({
        title: "NFT Transferred",
        description: `Transaction signature: ${signature}`,
      })
      transferForm.reset()
      await fetchNFTGallery()
    } catch (error) {
      console.error('Error transferring NFT:', error)
      toast({
        title: "Transfer Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onBurn = async (data) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to burn an NFT.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const signature = await burnNFT(
        connection,
        wallet.publicKey,
        new PublicKey(data.nftMint)
      )
      toast({
        title: "NFT Burned",
        description: `Transaction signature: ${signature}`,
      })
      burnForm.reset()
      await fetchNFTGallery()
    } catch (error) {
      console.error('Error burning NFT:', error)
      toast({
        title: "Burn Failed",
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
        <CardTitle>NFT Actions</CardTitle>
        <CardDescription>Mint, transfer, or burn NFTs</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mint">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mint">Mint</TabsTrigger>
            <TabsTrigger value="transfer">Transfer</TabsTrigger>
            <TabsTrigger value="burn">Burn</TabsTrigger>
          </TabsList>
          <TabsContent value="mint">
            <form onSubmit={mintForm.handleSubmit(onMint)} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...mintForm.register('name')} />
                {mintForm.formState.errors.name && (
                  <p className="text-red-500">{mintForm.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="symbol">Symbol</Label>
                <Input id="symbol" {...mintForm.register('symbol')} />
                {mintForm.formState.errors.symbol && (
                  <p className="text-red-500">{mintForm.formState.errors.symbol.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...mintForm.register('description')} />
                {mintForm.formState.errors.description && (
                  <p className="text-red-500">{mintForm.formState.errors.description.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input id="image" {...mintForm.register('image')} />
                {mintForm.formState.errors.image && (
                  <p className="text-red-500">{mintForm.formState.errors.image.message}</p>
                )}
              </div>
              <Button type="submit" disabled={isLoading || !wallet.connected}>
                {isLoading ? 'Minting...' : 'Mint NFT'}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="transfer">
            <form onSubmit={transferForm.handleSubmit(onTransfer)} className="space-y-4">
              <div>
                <Label htmlFor="nftMint">NFT Mint Address</Label>
                <Input id="nftMint" {...transferForm.register('nftMint')} />
                {transferForm.formState.errors.nftMint && (
                  <p className="text-red-500">{transferForm.formState.errors.nftMint.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input id="recipient" {...transferForm.register('recipient')} />
                {transferForm.formState.errors.recipient && (
                  <p className="text-red-500">{transferForm.formState.errors.recipient.message}</p>
                )}
              </div>
              <Button type="submit" disabled={isLoading || !wallet.connected}>
                {isLoading ? 'Transferring...' : 'Transfer NFT'}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="burn">
            <form onSubmit={burnForm.handleSubmit(onBurn)} className="space-y-4">
              <div>
                <Label htmlFor="nftMint">NFT Mint Address</Label>
                <Input id="nftMint" {...burnForm.register('nftMint')} />
                {burnForm.formState.errors.nftMint && (
                  <p className="text-red-500">{burnForm.formState.errors.nftMint.message}</p>
                )}
              </div>
              <Button type="submit" disabled={isLoading || !wallet.connected}>
                {isLoading ? 'Burning...' : 'Burn NFT'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}