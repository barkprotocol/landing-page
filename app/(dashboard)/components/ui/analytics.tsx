'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Jan', transactions: 400, volume: 2400, newUsers: 240 },
  { name: 'Feb', transactions: 300, volume: 1398, newUsers: 210 },
  { name: 'Mar', transactions: 200, volume: 9800, newUsers: 290 },
  { name: 'Apr', transactions: 278, volume: 3908, newUsers: 200 },
  { name: 'May', transactions: 189, volume: 4800, newUsers: 281 },
  { name: 'Jun', transactions: 239, volume: 3800, newUsers: 250 },
]

export function Analytics() {
  const [activeMetric, setActiveMetric] = useState<'transactions' | 'volume' | 'newUsers'>('transactions')

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
        <CardDescription>Your Milton network activity over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="transactions" onValueChange={(value) => setActiveMetric(value as typeof activeMetric)}>
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="volume">Volume</TabsTrigger>
            <TabsTrigger value="newUsers">New Users</TabsTrigger>
          </TabsList>
          <TabsContent value="transactions">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="transactions" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="volume">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="volume" stroke="#82ca9d" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="newUsers">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="newUsers" stroke="#ffc658" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}