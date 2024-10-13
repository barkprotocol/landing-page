import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Jan', revenue: 4000, expenses: 2400, profit: 1600 },
  { name: 'Feb', revenue: 3000, expenses: 1398, profit: 1602 },
  { name: 'Mar', revenue: 2000, expenses: 9800, profit: -7800 },
  { name: 'Apr', revenue: 2780, expenses: 3908, profit: -1128 },
  { name: 'May', revenue: 1890, expenses: 4800, profit: -2910 },
  { name: 'Jun', revenue: 2390, expenses: 3800, profit: -1410 },
  { name: 'Jul', revenue: 3490, expenses: 4300, profit: -810 },
]

export function Financial() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Financial Overview</CardTitle>
        <CardDescription>Monthly revenue, expenses, and profit</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" />
              <Bar dataKey="expenses" fill="hsl(var(--secondary))" />
              <Bar dataKey="profit" fill="hsl(var(--accent))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold">$19,550</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
            <p className="text-2xl font-bold">$30,406</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
            <p className="text-2xl  font-bold text-accent">-$10,856</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}