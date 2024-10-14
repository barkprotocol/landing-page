import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, DollarSign, BarChart2, Activity } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Jan', price: 0.1 },
  { name: 'Feb', price: 0.15 },
  { name: 'Mar', price: 0.12 },
  { name: 'Apr', price: 0.18 },
  { name: 'May', price: 0.22 },
  { name: 'Jun', price: 0.2 },
  { name: 'Jul', price: 0.25 },
]

export function MarketOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Market Overview</CardTitle>
        <CardDescription>Current market statistics for MILTON</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <DollarSign className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm font-medium text-muted-foreground">Current Price</p>
              <h3 className="text-2xl font-bold">$0.25</h3>
              <Badge variant="secondary" className="mt-2">+5.2%</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <BarChart2 className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm font-medium text-muted-foreground">Market Cap</p>
              <h3 className="text-2xl font-bold">$25M</h3>
              <Badge variant="secondary" className="mt-2">Rank #420</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Activity className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm font-medium text-muted-foreground">24h Volume</p>
              <h3 className="text-2xl font-bold">$1.5M</h3>
              <Badge variant="secondary" className="mt-2">+12.3%</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <TrendingUp className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm font-medium text-muted-foreground">All-Time High</p>
              <h3 className="text-2xl font-bold">$0.30</h3>
              <Badge variant="secondary" className="mt-2">30 days ago</Badge>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Price History</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="price" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}