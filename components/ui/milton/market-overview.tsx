import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, BarChart2, Activity, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const data = [
  { name: 'Jan', price: 0.1 },
  { name: 'Feb', price: 0.15 },
  { name: 'Mar', price: 0.12 },
  { name: 'Apr', price: 0.18 },
  { name: 'May', price: 0.22 },
  { name: 'Jun', price: 0.2 },
  { name: 'Jul', price: 0.25 },
]

const calculatePercentageChange = (currentValue: number, previousValue: number) => {
  const change = ((currentValue - previousValue) / previousValue) * 100
  return change.toFixed(1)
}

const formatLargeNumber = (num: number) => {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
  return num.toString()
}

const StatCard = ({ icon: Icon, title, value, badgeContent, badgeVariant }) => (
  <Card>
    <CardContent className="flex flex-col items-center justify-center p-6">
      <Icon className="h-8 w-8 text-primary mb-2" aria-hidden="true" />
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
      {badgeContent && (
        <Badge variant={badgeVariant} className="mt-2">
          {badgeContent}
        </Badge>
      )}
    </CardContent>
  </Card>
)

export function MarketOverview() {
  const currentPrice = data[data.length - 1].price
  const previousPrice = data[data.length - 2].price
  const priceChange = calculatePercentageChange(currentPrice, previousPrice)

  const circulatingSupply = 100000000 // Example circulating supply
  const marketCap = currentPrice * circulatingSupply
  const volume24h = 1500000 // Example 24h volume
  const volumeChange = calculatePercentageChange(volume24h, volume24h * 0.9) // Assuming previous volume was 90% of current

  const allTimeHigh = Math.max(...data.map(d => d.price))
  const daysAgo = data.length - 1 - data.findIndex(d => d.price === allTimeHigh)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Market Overview</CardTitle>
        <CardDescription>Current market statistics for MILTON</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={DollarSign}
            title="Current Price"
            value={`$${currentPrice.toFixed(2)}`}
            badgeContent={`${priceChange}%`}
            badgeVariant={Number(priceChange) >= 0 ? 'secondary' : 'destructive'}
          />
          <StatCard
            icon={BarChart2}
            title="Market Cap"
            value={`$${formatLargeNumber(marketCap)}`}
            badgeContent="Rank #420"
            badgeVariant="secondary"
          />
          <StatCard
            icon={Activity}
            title="24h Volume"
            value={`$${formatLargeNumber(volume24h)}`}
            badgeContent={`${volumeChange}%`}
            badgeVariant={Number(volumeChange) >= 0 ? 'secondary' : 'destructive'}
          />
          <StatCard
            icon={TrendingUp}
            title="All-Time High"
            value={`$${allTimeHigh.toFixed(2)}`}
            badgeContent={`${daysAgo} days ago`}
            badgeVariant="secondary"
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Price History</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
