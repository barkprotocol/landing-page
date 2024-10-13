'use client'

import { useState, useEffect } from 'react'
import { TokenBalances } from './components/ui/token-balances'
import { RecentTransactions } from '../components/ui/recent-transactions'
import { PortfolioChart } from '../components/ui/portfolio-chart'
import { MiltonFeatures } from '../components/ui/features'
import { RewardsProgress } from '../components/ui/rewards-progress'
import { RecentBlinks } from '../components/ui/recent-blinks'
import { SolanaNetworkStatus } from '../components/ui/solana-network-status'
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Zap, Send, Wallet, RefreshCcw } from 'lucide-react'

const tokenData = [
  { name: 'MILTON', balance: 1000, value: 5000, change: 2.5 },
  { name: 'SOL', balance: 50, value: 2500, change: -1.2 },
  { name: 'USDC', balance: 2000, value: 2000, change: 0.1 },
]

const transactionData = [
  { id: 1, type: 'Received', amount: 100, token: 'MILTON', from: 'Alice', timestamp: '2024-05-01T10:00:00Z' },
  { id: 2, type: 'Sent', amount: 50, token: 'SOL', to: 'Bob', timestamp: '2024-05-02T14:30:00Z' },
  { id: 3, type: 'Swapped', amount: 200, fromToken: 'USDC', toToken: 'MILTON', timestamp: '2024-05-03T09:15:00Z' },
  { id: 4, type: 'Blink', amount: 25, token: 'MILTON', to: 'Charlie', timestamp: '2024-05-04T16:45:00Z' },
  { id: 5, type: 'Received', amount: 75, token: 'SOL', from: 'David', timestamp: '2024-05-05T11:20:00Z' },
]

const chartData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 4500 },
  { name: 'May', value: 6000 },
]

const rewardsData = [
  { name: 'Daily Login', progress: 5, total: 7, reward: '10 MILTON' },
  { name: 'Transaction Volume', progress: 750, total: 1000, reward: '50 MILTON' },
  { name: 'Referrals', progress: 3, total: 5, reward: '100 MILTON' },
]

const blinkData = [
  { recipient: 'Alice', amount: 50, token: 'MILTON', status: 'Completed' },
  { recipient: 'Bob', amount: 25, token: 'SOL', status: 'Pending' },
  { recipient: 'Charlie', amount: 100, token: 'USDC', status: 'Failed' },
]

export default function DashboardPage() {
  const [totalBalance, setTotalBalance] = useState(0)

  useEffect(() => {
    const total = tokenData.reduce((acc, token) => acc + token.value, 0)
    setTotalBalance(total)
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome to Your Milton Dashboard</h1>

      <TokenBalances tokenData={tokenData} totalBalance={totalBalance} />

      <SolanaNetworkStatus />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="blinks">Blinks</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <PortfolioChart data={chartData} />
            <RecentTransactions transactions={transactionData.slice(0, 3)} />
            <RecentBlinks blinks={blinkData.slice(0, 3)} />
          </div>
          <MiltonFeatures />
        </TabsContent>
        <TabsContent value="transactions">
          <RecentTransactions transactions={transactionData} />
        </TabsContent>
        <TabsContent value="rewards">
          <RewardsProgress rewards={rewardsData} />
        </TabsContent>
        <TabsContent value="blinks">
          <RecentBlinks blinks={blinkData} />
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button className="w-full">
          <Zap className="mr-2 h-4 w-4 text-[#FFEcb1]" /> Quick Blink
        </Button>
        <Button className="w-full">
          <Send className="mr-2 h-4 w-4 text-[#FFEcb1]" /> Send
        </Button>
        <Button className="w-full">
          <Wallet className="mr-2 h-4 w-4 text-[#FFEcb1]" /> Receive
        </Button>
        <Button className="w-full">
          <RefreshCcw className="mr-2 h-4 w-4 text-[#FFEcb1]" /> Swap
        </Button>
      </div>
    </div>
  )
}