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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { mintToken, transferTokens, burnTokens } from '@/lib/solana/token-utils'

const mintSchema = z.object({
  amount: z.string().min(1, 'Amount is required').refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Amount must be a positive number'),
  decimals: z.string().min(1, 'Decimals is required').refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0 && parseInt(val) <= 9, 'Decimals must be between 0 and 9'),
})

const transferSchema = z.object({
  recipient: z.string().min(1, 'Recipient address is required'),
  amount: z.string().min(1, 'Amount is required').refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Amount must be a positive number'),
  tokenMint: z.string().min(1, 'Token mint address is required'),
})

const burnSchema = z.object({
  amount: z.string().min(1, 'Amount is required').refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Amount must be a positive number'),
  tokenMint: z.string().min(1, 'Token mint address is required'),
})

interface TokenActionsProps {
  isDarkMode: boolean
  fetchTokenBalances: () => Promise<void>
}

export function TokenActions({ isDarkMode, fetchTokenBalances }: TokenActionsProps) {
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
        description: "Please connect your wallet to mint tokens.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const mintAddress = await mintToken(connection, wallet, parseFloat(data.amount), parseInt(data.decimals))
      toast({
        title: "Tokens Minted",
        description: `Tokens minted with mint address: ${mintAddress}`,
      })
      mintForm.reset()
      await fetchTokenBalances()
    } catch (error) {
      console.error('Error minting tokens:', error)
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
        description: "Please connect your wallet to transfer tokens.",
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
        title: "Tokens Transferred",
        description: `Transaction signature: ${signature}`,
      })
      transferForm.reset()
      await fetchTokenBalances()
    } catch (error) {
      console.error('Error transferring tokens:', error)
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
        description: "Please connect your wallet to burn tokens.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const signature = await burnTokens(
        connection,
        wallet,
        parseFloat(data.amount),
        new PublicKey(data.tokenMint)
      )
      toast({
        title: "Tokens Burned",
        description: `Transaction signature: ${signature}`,
      })
      burnForm.reset()
      await fetchTokenBalances()
    } catch (error) {
      console.error('Error burning tokens:', error)
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
        <CardTitle>Token Actions</CardTitle>
        <CardDescription>Mint, transfer, or burn tokens</CardDescription>
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
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" step="0.000000001" {...mintForm.register('amount')} />
                {mintForm.formState.errors.amount && (
                  <p className="text-red-500">{mintForm.formState.errors.amount.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="decimals">Decimals</Label>
                <Input id="decimals" type="number" min="0" max="9" {...mintForm.register('decimals')} />
                {mintForm.formState.errors.decimals && (
                  <p className="text-red-500">{mintForm.formState.errors.decimals.message}</p>
                )}
              </div>
              <Button type="submit" disabled={isLoading || !wallet.connected}>
                {isLoading ? 'Minting...' : 'Mint Tokens'}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="transfer">
            <form onSubmit={transferForm.handleSubmit(onTransfer)} className="space-y-4">
              <div>
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input id="recipient" {...transferForm.register('recipient')} />
                {transferForm.formState.errors.recipient && (
                  <p className="text-red-500">{transferForm.formState.errors.recipient.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" step="0.000000001" {...transferForm.register('amount')} />
                {transferForm.formState.errors.amount && (
                  <p className="text-red-500">{transferForm.formState.errors.amount.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="tokenMint">Token Mint Address</Label>
                <Input id="tokenMint" {...transferForm.register('tokenMint')} />
                {transferForm.formState.errors.tokenMint && (
                  <p className="text-red-500">{transferForm.formState.errors.tokenMint.message}</p>
                )}
              </div>
              <Button type="submit" disabled={isLoading || !wallet.connected}>
                {isLoading ? 'Transferring...' : 'Transfer Tokens'}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="burn">
            <form onSubmit={burnForm.handleSubmit(onBurn)} className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" step="0.000000001" {...burnForm.register('amount')} />
                {burnForm.formState.errors.amount && (
                  <p className="text-red-500">{burnForm.formState.errors.amount.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="tokenMint">Token Mint Address</Label>
                <Input id="tokenMint" {...burnForm.register('tokenMint')} />
                {burnForm.formState.errors.tokenMint && (
                  <p className="text-red-500">{burnForm.formState.errors.tokenMint.message}</p>
                )}
              </div>
              <Button type="submit" disabled={isLoading || !wallet.connected}>
                {isLoading ? 'Burning...' : 'Burn Tokens'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}