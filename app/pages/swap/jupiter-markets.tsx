"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Loader2, Search } from "lucide-react"

interface Market {
  id: string
  label: string
  inputMint: string
  outputMint: string
  liquidityUsd: number
  price: number
  volume24h: number
}

export default function JupiterMarkets() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [filteredMarkets, setFilteredMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response = await fetch('https://cache.jup.ag/markets?v=3')
        if (!response.ok) {
          throw new Error('Failed to fetch market data')
        }
        const data = await response.json()
        setMarkets(data)
        setFilteredMarkets(data)
      } catch (err) {
        setError('Error fetching market data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchMarkets()
  }, [])

  useEffect(() => {
    const filtered = markets.filter(market => 
      market.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredMarkets(filtered)
  }, [searchTerm, markets])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-8">
        <CardContent className="pt-6">
          <p className="text-center text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Jupiter Markets</CardTitle>
        <CardDescription>View and search Jupiter market data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search markets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Market</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Liquidity (USD)</TableHead>
                <TableHead>24h Volume</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMarkets.map((market) => (
                <TableRow key={market.id}>
                  <TableCell className="font-medium">{market.label}</TableCell>
                  <TableCell>{formatNumber(market.price)}</TableCell>
                  <TableCell>{formatNumber(market.liquidityUsd)}</TableCell>
                  <TableCell>{formatNumber(market.volume24h)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}