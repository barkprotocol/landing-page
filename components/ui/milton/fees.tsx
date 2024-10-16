import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Info } from 'lucide-react'
import { ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const navajoWhite = '#ffc272'

const feeData = {
  spl: [
    { name: 'Liquidity Pool', value: 35, color: navajoWhite },
    { name: 'Community Treasury', value: 25, color: 'hsl(var(--primary))' },
    { name: 'Charitable Causes', value: 20, color: 'hsl(var(--secondary))' },
    { name: 'Development Fund', value: 10, color: 'hsl(var(--accent))' },
    { name: 'Governance', value: 5, color: 'hsl(var(--muted))' },
    { name: 'Treasury Fund', value: 5, color: 'hsl(var(--warning))' },
  ],
  token2022: [
    { name: 'Liquidity Pool', value: 45, color: navajoWhite },
    { name: 'Community Treasury', value: 20, color: 'hsl(var(--primary))' },
    { name: 'Charitable Causes', value: 15, color: 'hsl(var(--secondary))' },
    { name: 'Development Fund', value: 10, color: 'hsl(var(--accent))' },
    { name: 'Governance', value: 5, color: 'hsl(var(--muted))' },
    { name: 'Treasury Fund', value: 5, color: 'hsl(var(--warning))' },
  ],
}

const transactionTypes = {
  spl: [
    { type: 'Buy', fee: '1.5%' },
    { type: 'Sell', fee: '2%' },
    { type: 'Transfer', fee: '0.5%' },
  ],
  token2022: [
    { type: 'All Transactions', fee: '5%' },
  ],
}

const FeeAllocationChart = ({ data }: { data: typeof feeData.spl }) => (
  <ChartContainer className="h-[300px]">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent />} />
      </PieChart>
    </ResponsiveContainer>
    <ChartLegend className="mt-4" />
  </ChartContainer>
)

const TransactionFeeTable = ({ data }: { data: typeof transactionTypes.spl }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Transaction Type</TableHead>
        <TableHead>Fee</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((transaction, index) => (
        <TableRow key={index}>
          <TableCell className="font-medium">{transaction.type}</TableCell>
          <TableCell>{transaction.fee}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)

export function Fees() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">MILTON Fee Structure</CardTitle>
        <CardDescription>Breakdown of transaction fees and their allocation for SPL and Token-2022 versions</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="spl" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="spl">SPL Token</TabsTrigger>
            <TabsTrigger value="token2022">Token-2022</TabsTrigger>
          </TabsList>
          <TabsContent value="spl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Fee Allocation (SPL)</h3>
                <FeeAllocationChart data={feeData.spl} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Transaction Fees (SPL)</h3>
                <TransactionFeeTable data={transactionTypes.spl} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="token2022">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Fee Allocation (Token-2022)</h3>
                <FeeAllocationChart data={feeData.token2022} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Transaction Fees (Token-2022)</h3>
                <TransactionFeeTable data={transactionTypes.token2022} />
                <p className="mt-4 text-sm text-muted-foreground">
                  Note: The Token-2022 version of MILTON implements a flat 5% fee on all transactions, as allowed by the Solana Token-2022 standard.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="text-lg font-semibold mb-2 flex items-center">
            <Info className="w-5 h-5 mr-2" aria-hidden="true" />
            Fee Allocation Breakdown
          </h4>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li><span className="font-medium">Liquidity Pool:</span> Ensures smooth trading experience and price stability</li>
            <li><span className="font-medium">Community Treasury:</span> Funds community-driven initiatives and rewards</li>
            <li><span className="font-medium">Charitable Causes:</span> Supports various charitable organizations and initiatives</li>
            <li><span className="font-medium">Development Fund:</span> Finances ongoing platform development and improvements</li>
            <li><span className="font-medium">Governance:</span> Allocated for community voting and decision-making processes</li>
            <li><span className="font-medium">Treasury Fund:</span> Reserved for unforeseen expenses and long-term sustainability</li>
          </ul>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Note: Fees are subject to change based on community governance decisions. A portion of all fees contributes to charitable causes and community initiatives.
        </p>
      </CardContent>
    </Card>
  )
}