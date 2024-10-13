import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const data = [
  { month: 'Launch', Team: 0, Advisors: 0, Community: 1000000 },
  { month: '3', Team: 100000, Advisors: 50000, Community: 1500000 },
  { month: '6', Team: 200000, Advisors: 100000, Community: 2000000 },
  { month: '9', Team: 300000, Advisors: 150000, Community: 2500000 },
  { month: '12', Team: 400000, Advisors: 200000, Community: 3000000 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-4 rounded-lg shadow-md">
        <p className="font-semibold mb-2">{`Month: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} className="text-sm">
            <span className="font-medium" style={{ color: entry.color }}>{entry.name}</span>: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function TokenVesting() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Token Vesting Schedule</CardTitle>
        <CardDescription>Release of tokens over time (in millions)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                stroke="hsl(var(--foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${value / 1000000}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="Team" 
                stackId="1" 
                stroke="hsl(var(--primary))" 
                fill="hsl(var(--primary))" 
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="Advisors" 
                stackId="1" 
                stroke="hsl(var(--secondary))" 
                fill="hsl(var(--secondary))" 
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="Community" 
                stackId="1" 
                stroke="hsl(var(--accent))" 
                fill="hsl(var(--accent))" 
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}