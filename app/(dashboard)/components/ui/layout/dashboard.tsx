'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, RefreshCw, ArrowRight, DollarSign, Coins, Users } from 'lucide-react'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const API_BASE_URL = 'https://miltonprotocol.com/api/v1'

interface TokenInfo {
  milton: {
    supply: number
    decimals: number
    price: number
    treasuryBalance: number
  }
  usdc: {
    supply: number
    decimals: number
    price: number
    treasuryBalance: number
  }
}

interface Transaction {
  id: string
  type: string
  amount: number
  status: string
  date: string
}

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
  }[]
}

export function MiltonDashboard() {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchTokenInfo()
    fetchTransactions()
    fetchChartData()
  }, [])

  const fetchTokenInfo = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/milton/tokens`)
      if (!response.ok) throw new Error('Failed to fetch token info')
      const data: TokenInfo = await response.json()
      setTokenInfo(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch token information. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/milton/transactions`)
      if (!response.ok) throw new Error('Failed to fetch transactions')
      const data: Transaction[] = await response.json()
      setTransactions(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch transactions. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchChartData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/milton/chart-data`)
      if (!response.ok) throw new Error('Failed to fetch chart data')
      const data: ChartData = await response.json()
      setChartData(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch chart data. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-8">Milton Dashboard</h1>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2" />
              Milton Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${tokenInfo?.milton.price.toFixed(4)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Coins className="mr-2" />
              Total Supply
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{tokenInfo?.milton.supply.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2" />
              Treasury Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{tokenInfo?.milton.treasuryBalance.toLocaleString()} MLTN</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Price History</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData && (
            <Line
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'Milton Token Price History',
                  },
                },
              }}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.id}</TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell>{tx.amount} MLTN</TableCell>
                  <TableCell>{tx.status}</TableCell>
                  <TableCell>{new Date(tx.date).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Input placeholder="Amount" type="number" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="milton">MLTN</SelectItem>
                <SelectItem value="usdc">USDC</SelectItem>
              </SelectContent>
            </Select>
            <Button>Swap <ArrowRight className="ml-2" /></Button>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={fetchTokenInfo}>
              Refresh Data <RefreshCw className="ml-2" />
            </Button>
            <Button>View All Transactions</Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
    </div>
  )
}