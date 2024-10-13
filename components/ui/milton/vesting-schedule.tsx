import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const vestingData = [
  { month: 0, Team: 0, Advisors: 0, PrivateSale: 0, PublicSale: 100 },
  { month: 3, Team: 10, Advisors: 15, PrivateSale: 25, PublicSale: 100 },
  
  { month: 6, Team: 20, Advisors: 30, PrivateSale: 50, PublicSale: 100 },
  { month: 9, Team: 30, Advisors: 45, PrivateSale: 75, PublicSale: 100 },
  { month: 12, Team: 40, Advisors: 60, PrivateSale: 100, PublicSale: 100 },
  { month: 15, Team: 50, Advisors: 75, PrivateSale: 100, PublicSale: 100 },
  { month: 18, Team: 60, Advisors: 90, PrivateSale: 100, PublicSale: 100 },
  { month: 21, Team: 70, Advisors: 100, PrivateSale: 100, PublicSale: 100 },
  { month: 24, Team: 80, Advisors: 100, PrivateSale: 100, PublicSale: 100 },
  { month: 27, Team: 90, Advisors: 100, PrivateSale: 100, PublicSale: 100 },
  { month: 30, Team: 100, Advisors: 100, PrivateSale: 100, PublicSale: 100 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-4 rounded-lg shadow-md">
        <p className="font-semibold mb-2">{`Month: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} className="text-sm">
            <span className="font-medium" style={{ color: entry.color }}>{entry.name}</span>: {entry.value}%
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function VestingSchedule() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Vesting Schedule</CardTitle>
        <CardDescription>Token release schedule for different stakeholders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={vestingData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
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
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Team" fill="hsl(var(--primary))" />
              <Bar dataKey="Advisors" fill="hsl(var(--secondary))" />
              <Bar dataKey="PrivateSale" fill="hsl(var(--accent))" />
              <Bar dataKey="PublicSale" fill="hsl(var(--muted))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stakeholder</TableHead>
              <TableHead>Vesting Period</TableHead>
              <TableHead>Initial Unlock</TableHead>
              <TableHead>Cliff</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Team</TableCell>
              <TableCell>30 months</TableCell>
              <TableCell>0%</TableCell>
              <TableCell>3 months</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Advisors</TableCell>
              <TableCell>21 months</TableCell>
              <TableCell>0%</TableCell>
              <TableCell>3 months</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Private Sale</TableCell>
              <TableCell>12 months</TableCell>
              <TableCell>0%</TableCell>
              <TableCell>1 month</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Public Sale</TableCell>
              <TableCell>No vesting</TableCell>
              <TableCell>100%</TableCell>
              <TableCell>N/A</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}