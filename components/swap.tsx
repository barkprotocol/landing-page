'use client'

import { useState, useEffect, useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey } from '@solana/web3.js'
import { createJupiterApiClient, RouteInfo, TOKEN_LIST_URL } from '@jup-ag/api'
import { TokenInfo } from '@solana/spl-token-registry'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowDownUp, RefreshCw, AlertTriangle } from 'lucide-react'
import Image from 'next/image'
import { toast } from '@/components/ui/use-toast'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const SOLANA_RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com'

const config = {
  basePath: 'https://swap.miltontoken.com'
}
const jupiterQuoteApi = createJupiterApiClient(config)

const SUPPORTED_TOKENS = ['SOL', 'MILTON', 'USDC']
const ICON_COLOR = '#F0E651'

const CURRENCY_ICONS = {
  SOL: 'https://ucarecdn.com/8bcc4664-01b2-4a88-85bc-9ebce234f08b/sol.png',
  MILTON: 'https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg',
  USDC: 'https://ucarecdn.com/67e17a97-f3bd-46c0-8627-e13b8b939d26/usdc.png'
}

export default function SwapPage() {
  const { publicKey, signTransaction } = useWallet()
  const [inputAmount, setInputAmount] = useState<number>(0)
  const [routes, setRoutes] = useState<RouteInfo[]>([])
  const [slippage, setSlippage] = useState<number>(1)
  const [selectedRoute, setSelectedRoute] = useState<RouteInfo | null>(null)
  const [inputToken, setInputToken] = useState<string>('SOL')
  const [outputToken, setOutputToken] = useState<string>('MILTON')
  const [tokens, setTokens] = useState<TokenInfo[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const connection = useMemo(() => new Connection(SOLANA_RPC_ENDPOINT), [])

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await fetch(TOKEN_LIST_URL['mainnet-beta'])
        if (!response.ok) {
          throw new Error('Failed to fetch token list')
        }
        const tokenList = await response.json()
        const filteredTokens = tokenList.filter((token: TokenInfo) => 
          SUPPORTED_TOKENS.includes(token.symbol)
        )
        setTokens(filteredTokens)
      } catch (error) {
        console.error('Error fetching token list:', error)
        setError('Failed to load supported tokens. Please try again later.')
      }
    }
    fetchTokens()
  }, [])

  const getTokenInfo = (symbol: string) => {
    return tokens.find((t) => t.symbol === symbol)
  }

  const getTokenMint = (symbol: string) => {
    const token = getTokenInfo(symbol)
    return token ? new PublicKey(token.address) : null
  }

  const handleSwap = async () => {
    if (!publicKey || !signTransaction || !selectedRoute) {
      setError('Please connect your wallet and select a route before swapping.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { swapTransaction } = await jupiterQuoteApi.swapPost({
        route: selectedRoute,
        userPublicKey: publicKey.toBase58(),
        wrapUnwrapSOL: true,
      })

      const transaction = Transaction.from(Buffer.from(swapTransaction, 'base64'))
      const signedTransaction = await signTransaction(transaction)
      const rawTransaction = signedTransaction.serialize()
      
      const txid = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 2
      })
      await connection.confirmTransaction(txid, 'confirmed')

      toast({
        title: "Swap Successful",
        description: `Successfully swapped ${inputAmount} ${inputToken} for ${selectedRoute.outAmount / 10 ** 9} ${outputToken}`,
      })
    } catch (error) {
      console.error('Error during swap:', error)
      setError('An error occurred while processing the swap. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetRoutes = async () => {
    if (!publicKey) {
      setError('Please connect your wallet to get swap routes.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const inputMint = getTokenMint(inputToken)
      const outputMint = getTokenMint(outputToken)

      if (!inputMint || !outputMint) {
        throw new Error('Invalid input or output token')
      }

      const routes = await jupiterQuoteApi.quoteGet({
        inputMint: inputMint.toBase58(),
        outputMint: outputMint.toBase58(),
        amount: (inputAmount * 10 ** 9).toString(), // Convert to lamports
        slippageBps: slippage * 100,
      })

      setRoutes(routes.data)
      setSelectedRoute(routes.data[0])
    } catch (error) {
      console.error('Error fetching routes:', error)
      setError('Failed to fetch swap routes. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const TokenSelect = ({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) => (
    <div className="space-y-2">
      <Label htmlFor={label}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={label} className="w-full">
          <SelectValue placeholder="Select token" />
        </SelectTrigger>
        <SelectContent>
          {tokens.map((token) => (
            <SelectItem key={token.address} value={token.symbol}>
              <div className="flex items-center">
                <Image
                  src={CURRENCY_ICONS[token.symbol as keyof typeof CURRENCY_ICONS] || '/placeholder.svg'}
                  alt={token.symbol}
                  width={24}
                  height={24}
                  className="mr-2 rounded-full"
                />
                {token.symbol}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Swap Tokens</CardTitle>
          <CardDescription>
            Easily swap between SOL, MILTON, and USDC using Jupiter's liquidity aggregator for the best rates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <TokenSelect value={inputToken} onChange={setInputToken} label="From" />
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setInputToken(outputToken)
                  setOutputToken(inputToken)
                }}
                aria-label="Switch tokens"
              >
                <ArrowDownUp className="h-4 w-4" style={{ color: ICON_COLOR }} />
              </Button>
            </div>
            <TokenSelect value={outputToken} onChange={setOutputToken} label="To" />
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={inputAmount}
                onChange={(e) => setInputAmount(parseFloat(e.target.value))}
                className="w-full"
                min="0"
                step="0.000000001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slippage">Slippage Tolerance (%)</Label>
              <Input
                id="slippage"
                type="number"
                placeholder="Enter slippage"
                value={slippage}
                onChange={(e) => setSlippage(parseFloat(e.target.value))}
                className="w-full"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button onClick={handleGetRoutes} disabled={isLoading || !publicKey} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" style={{ color: ICON_COLOR }} /> : 'Get Best Route'}
          </Button>
          {selectedRoute && (
            <div className="text-sm bg-secondary p-4 rounded-md">
              <div className="flex justify-between items-center">
                <p className="font-semibold">Best route:</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={handleGetRoutes} disabled={isLoading}>
                        <RefreshCw className="h-4 w-4" style={{ color: ICON_COLOR }} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Refresh routes</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p>{selectedRoute.marketInfos.map((m) => m.label).join(' -> ')}</p>
              <p className="mt-2">
                <span className="font-semibold">You'll receive:</span>{' '}
                {(selectedRoute.outAmount / 10 ** 9).toFixed(6)} {outputToken}
              </p>
              <p>
                <span className="font-semibold">Price impact:</span>{' '}
                {(selectedRoute.priceImpactPct * 100).toFixed(2)}%
              </p>
              <p>
                <span className="font-semibold">Minimum received:</span>{' '}
                {(selectedRoute.outAmountWithSlippage / 10 ** 9).toFixed(6)} {outputToken}
              </p>
            </div>
          )}
          <Button onClick={handleSwap} disabled={isLoading || !selectedRoute || !publicKey} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" style={{ color: ICON_COLOR }} /> : 'Swap'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}