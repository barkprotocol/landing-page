'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, RefreshCcw, AlertTriangle } from 'lucide-react'

interface PriceData {
  source: string
  price: number
  change24h: number
  volume24h: number
  lastUpdated: string
}

const formatCurrency = (num: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
}

const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

export function PriceRate() {
  const [priceData, setPriceData] = useState<PriceData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPriceData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // In a real application, these would be separate API calls
      const coinGeckoData = await fetchCoinGeckoData()
      const jupiterData = await fetchJupiterData()
      const coinMarketCapData = await fetchCoinMarketCapData()

      setPriceData([coinGeckoData, jupiterData, coinMarketCapData])
    } catch (err) {
      setError('Failed to fetch price data. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPriceData()
    // Set up an interval to fetch data every 5 minutes
    const interval = setInterval(fetchPriceData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // These functions would make actual API calls in a real application
  const fetchCoinGeckoData = async (): Promise<PriceData> => {
    // Simulated API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      source: 'CoinGecko',
      price: 0.00001,
      change24h: 5.23,
      volume24h: 1500000,
      lastUpdated: new Date().toISOString()
    }
  }

  const fetchJupiterData = async (): Promise<PriceData> => {
    // Simulated API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      source: 'Jupiter',
      price: 0.000011,
      change24h: 5.5,
      volume24h: 1600000,
      lastUpdated: new Date().toISOString()
    }
  }

  const fetchCoinMarketCapData = async (): Promise<PriceData> => {
    // Simulated API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      source: 'CoinMarketCap',
      price: 0.0000105,
      change24h: 5.1,
      volume24h: 1550000,
      lastUpdated: new Date().toISOString()
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <RefreshCcw className="w-6 h-6" />
          MILTON Price Rate
        </CardTitle>
        <CardDescription>Real-time price data from multiple sources</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <RefreshCcw className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="cards">Card View</TabsTrigger>
            </TabsList>
            <TabsContent value="table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>24h Change</TableHead>
                    <TableHead>24h Volume</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceData.map((data) => (
                    <TableRow key={data.source}>
                      <TableCell className="font-medium">{data.source}</TableCell>
                      <TableCell>{formatCurrency(data.price)}</TableCell>
                      <TableCell>
                        <Badge variant={data.change24h >= 0 ? "success" : "destructive"}>
                          {data.change24h >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                          {data.change24h}%
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(data.volume24h)}</TableCell>
                      <TableCell>{new Date(data.lastUpdated).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="cards">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {priceData.map((data) => (
                  <Card key={data.source}>
                    <CardHeader>
                      <CardTitle>{data.source}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Price:</span>
                          <span className="font-bold">{formatCurrency(data.price)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">24h Change:</span>
                          <Badge variant={data.change24h >= 0 ? "success" : "destructive"}>
                            {data.change24h >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                            {data.change24h}%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">24h Volume:</span>
                          <span>{formatCurrency(data.volume24h)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Last Updated:</span>
                          <span>{new Date(data.lastUpdated).toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}