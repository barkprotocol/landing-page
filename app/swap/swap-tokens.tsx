'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'

const MILTON_LOGO = 'https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg/-/preview/1000x981/-/quality/smart/-/format/auto/'
const SWAP_AMOUNT_USD_OPTIONS = [10, 100, 1000]
const DEFAULT_SWAP_AMOUNT_USD = 10
const US_DOLLAR_FORMATTING = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

interface TokenMeta {
  symbol: string
  address: string
  decimals: number
}

interface SwapProps {
  jupiterApi: any // Replace with actual Jupiter API type
  connection: Connection
}

export default function SwapComponent({ jupiterApi, connection }: SwapProps) {
  const wallet = useWallet()
  const { publicKey, signTransaction } = wallet
  const [inputToken, setInputToken] = useState<TokenMeta | null>(null)
  const [outputToken, setOutputToken] = useState<TokenMeta | null>(null)
  const [amount, setAmount] = useState(DEFAULT_SWAP_AMOUNT_USD.toString())
  const [isSwapping, setIsSwapping] = useState(false)
  const [availableTokens, setAvailableTokens] = useState<TokenMeta[]>([])
  const { toast } = useToast()

  useEffect(() => {
    async function fetchAvailableTokens() {
      try {
        const tokens = await jupiterApi.fetchAvailableTokens()
        setAvailableTokens(tokens)
      } catch (error) {
        console.error('Error fetching available tokens:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch available tokens. Please try again.',
          variant: 'destructive',
        })
      }
    }
    fetchAvailableTokens()
  }, [jupiterApi, toast])

  const handleSwap = async () => {
    if (!publicKey || !signTransaction || !inputToken || !outputToken) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet and select tokens.',
        variant: 'destructive',
      })
      return
    }

    setIsSwapping(true)

    try {
      const tokenUsdPrices = await jupiterApi.getTokenPricesInUsdc([inputToken.address])
      const tokenPriceUsd = tokenUsdPrices[inputToken.address]
      
      if (!tokenPriceUsd) {
        throw new Error(`Failed to get price for ${inputToken.symbol}.`)
      }

      const tokenAmount = parseFloat(amount) / tokenPriceUsd.price
      const tokenAmountFractional = Math.ceil(tokenAmount * 10 ** inputToken.decimals)

      const quote = await jupiterApi.quoteGet({
        inputMint: inputToken.address,
        outputMint: outputToken.address,
        amount: tokenAmountFractional,
        autoSlippage: true,
        maxAutoSlippageBps: 500, // 5%
      })

      const swapResponse = await jupiterApi.swapPost({
        swapRequest: {
          quoteResponse: quote,
          userPublicKey: publicKey.toBase58(),
          prioritizationFeeLamports: 'auto',
        },
      })

      const transaction = Transaction.from(Buffer.from(swapResponse.swapTransaction, 'base64'))
      const signedTransaction = await signTransaction(transaction)
      const signature = await connection.sendRawTransaction(signedTransaction.serialize())
      await connection.confirmTransaction(signature, 'confirmed')

      toast({
        title: 'Swap Successful',
        description: `Successfully swapped ${inputToken.symbol} for ${outputToken.symbol}.`,
      })
    } catch (error) {
      console.error('Swap error:', error)
      toast({
        title: 'Swap Failed',
        description: 'There was an error during the swap. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSwapping(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Image src={MILTON_LOGO} alt="Milton Logo" width={32} height={32} className="mr-2" />
            Milton Swap
          </CardTitle>
          <CardDescription>Swap tokens using Jupiter API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inputToken">Input Token</Label>
            <Select value={inputToken?.symbol} onValueChange={(value) => setInputToken(availableTokens.find(t => t.symbol === value) || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Select input token" />
              </SelectTrigger>
              <SelectContent>
                {availableTokens.map((token) => (
                  <SelectItem key={token.address} value={token.symbol}>{token.symbol}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="outputToken">Output Token</Label>
            <Select value={outputToken?.symbol} onValueChange={(value) => setOutputToken(availableTokens.find(t => t.symbol === value) || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Select output token" />
              </SelectTrigger>
              <SelectContent>
                {availableTokens.map((token) => (
                  <SelectItem key={token.address} value={token.symbol}>{token.symbol}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <div className="flex space-x-2">
              {SWAP_AMOUNT_USD_OPTIONS.map((option) => (
                <Button
                  key={option}
                  variant={amount === option.toString() ? 'default' : 'outline'}
                  onClick={() => setAmount(option.toString())}
                >
                  {US_DOLLAR_FORMATTING.format(option)}
                </Button>
              ))}
            </div>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter custom amount"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSwap} className="w-full" disabled={isSwapping || !publicKey || !inputToken || !outputToken}>
            {isSwapping ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Swapping...
              </>
            ) : (
              'Swap'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}