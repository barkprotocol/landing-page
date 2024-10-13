import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle } from 'lucide-react'

const MILTON_PRICE = 0.000001 // Placeholder price, replace with actual or dynamic price

type TransactionType = 'buy' | 'sell' | 'transfer'
type TokenVersion = 'spl' | 'token2022'
type Currency = 'USD' | 'SOL' | 'USDC'

interface FeeAllocation {
  liquidityPool: number
  communityTreasury: number
  charitableCauses: number
  developmentFund: number
  governance: number
  treasuryFund: number
}

const feeAllocations: Record<TokenVersion, FeeAllocation> = {
  spl: {
    liquidityPool: 0.35,
    communityTreasury: 0.25,
    charitableCauses: 0.20,
    developmentFund: 0.10,
    governance: 0.05,
    treasuryFund: 0.05,
  },
  token2022: {
    liquidityPool: 0.45,
    communityTreasury: 0.20,
    charitableCauses: 0.15,
    developmentFund: 0.10,
    governance: 0.05,
    treasuryFund: 0.05,
  },
}

const feeRates: Record<TokenVersion, Record<TransactionType, number>> = {
  spl: {
    buy: 0.015,
    sell: 0.02,
    transfer: 0.005,
  },
  token2022: {
    buy: 0.05,
    sell: 0.05,
    transfer: 0.05,
  },
}

export function TokenCalculator() {
  const [amount, setAmount] = useState<number>(0)
  const [transactionType, setTransactionType] = useState<TransactionType>('buy')
  const [tokenVersion, setTokenVersion] = useState<TokenVersion>('spl')
  const [inputCurrency, setInputCurrency] = useState<Currency>('USD')
  const [outputCurrency, setOutputCurrency] = useState<Currency>('USD')
  const [fee, setFee] = useState<number>(0)
  const [miltonAmount, setMiltonAmount] = useState<number>(0)
  const [totalCost, setTotalCost] = useState<number>(0)
  const [allocation, setAllocation] = useState<Record<keyof FeeAllocation, number>>({} as Record<keyof FeeAllocation, number>)
  const [solPrice, setSolPrice] = useState<number>(0)
  const [usdcPrice, setUsdcPrice] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPrices = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana,usd-coin&vs_currencies=usd')
        if (!response.ok) {
          throw new Error('Failed to fetch prices')
        }
        const data = await response.json()
        setSolPrice(data.solana.usd)
        setUsdcPrice(data['usd-coin'].usd)
      } catch (error) {
        console.error('Error fetching prices:', error)
        setError('Failed to fetch current prices. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrices()
    const interval = setInterval(fetchPrices, 60000) // Update prices every minute

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isLoading || error) return

    const calculateFee = () => {
      const feeRate = feeRates[tokenVersion][transactionType]
      return amount * feeRate
    }

    const convertToUSD = (value: number, currency: Currency) => {
      switch (currency) {
        case 'SOL':
          return value * solPrice
        case 'USDC':
          return value * usdcPrice
        default:
          return value
      }
    }

    const convertFromUSD = (value: number, currency: Currency) => {
      switch (currency) {
        case 'SOL':
          return value / solPrice
        case 'USDC':
          return value / usdcPrice
        default:
          return value
      }
    }

    const amountInUSD = convertToUSD(amount, inputCurrency)
    const newFee = calculateFee()
    const newMiltonAmount = amountInUSD / MILTON_PRICE
    const newTotalCost = amountInUSD + newFee

    setFee(convertFromUSD(newFee, outputCurrency))
    setMiltonAmount(newMiltonAmount)
    setTotalCost(convertFromUSD(newTotalCost, outputCurrency))

    const newAllocation = Object.entries(feeAllocations[tokenVersion]).reduce((acc, [key, value]) => {
      acc[key as keyof FeeAllocation] = convertFromUSD(newFee * value, outputCurrency)
      return acc
    }, {} as Record<keyof FeeAllocation, number>)

    setAllocation(newAllocation)
  }, [amount, transactionType, tokenVersion, inputCurrency, outputCurrency, solPrice, usdcPrice, isLoading, error])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    setAmount(isNaN(value) ? 0 : value)
  }

  const formatCurrency = (value: number, currency: Currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'SOL' ? 'USD' : currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(value).replace('$', currency === 'SOL' ? 'SOL ' : '$')
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">MILTON Token Calculator</CardTitle>
        <CardDescription>Calculate token amounts, fees, and total costs for SPL and Token-2022 versions</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <Tabs value={tokenVersion} onValueChange={(value: TokenVersion) => setTokenVersion(value)} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="spl">SPL Token</TabsTrigger>
                <TabsTrigger value="token2022">Token-2022</TabsTrigger>
              </TabsList>
              <TabsContent value="spl" className="mt-4">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount-spl">Amount</Label>
                    <div className="flex gap-2">
                      <Input
                        id="amount-spl"
                        type="number"
                        placeholder="Enter amount"
                        value={amount || ''}
                        onChange={handleAmountChange}
                        className="flex-grow"
                      />
                      <Select value={inputCurrency} onValueChange={(value: Currency) => setInputCurrency(value)}>
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="SOL">SOL</SelectItem>
                          <SelectItem value="USDC">USDC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="transaction-type-spl">Transaction Type</Label>
                    <Select onValueChange={(value: TransactionType) => setTransactionType(value)}>
                      <SelectTrigger id="transaction-type-spl">
                        <SelectValue placeholder="Select transaction type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy">Buy</SelectItem>
                        <SelectItem value="sell">Sell</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="token2022" className="mt-4">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount-token2022">Amount</Label>
                    <div className="flex gap-2">
                      <Input
                        id="amount-token2022"
                        type="number"
                        placeholder="Enter amount"
                        value={amount || ''}
                        onChange={handleAmountChange}
                        className="flex-grow"
                      />
                      <Select value={inputCurrency} onValueChange={(value: Currency) => setInputCurrency(value)}>
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="SOL">SOL</SelectItem>
                          <SelectItem value="USDC">USDC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Note: Token-2022 version has a flat 5% fee for all transaction types.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
            <div className="space-y-6">
              <div className="p-4 bg-secondary rounded-lg">
                <h3 className="font-semibold mb-2">Calculation Results</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Output Currency:</span>
                    <Select value={outputCurrency} onValueChange={(value: Currency) => setOutputCurrency(value)}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="SOL">SOL</SelectItem>
                        <SelectItem value="USDC">USDC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p>MILTON Tokens: {miltonAmount.toFixed(6)}</p>
                  <p>Transaction Fee: {formatCurrency(fee, outputCurrency)} ({(fee / amount * 100).toFixed(2)}%)</p>
                  <p className="font-bold">Total Cost: {formatCurrency(totalCost, outputCurrency)}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Fee Allocation Breakdown</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Allocation</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(allocation).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</TableCell>
                        <TableCell>{formatCurrency(value, outputCurrency)}</TableCell>
                        <TableCell>{(value / fee * 100).toFixed(2)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}