import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const recentTransactions = [
  { id: 1, type: 'Send', amount: '100 MLT', to: '0x1234...5678', date: '2023-06-15' },
  { id: 2, type: 'Receive', amount: '50 MLT', from: '0x8765...4321', date: '2023-06-14' },
  { id: 3, type: 'Stake', amount: '200 MLT', date: '2023-06-13' },
  { id: 4, type: 'Swap', amount: '75 MLT', to: '150 USDC', date: '2023-06-12' },
  { id: 5, type: 'Unstake', amount: '100 MLT', date: '2023-06-11' },
]

export function RecentTransactions() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Details</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentTransactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell>{tx.type}</TableCell>
            <TableCell>{tx.amount}</TableCell>
            <TableCell>{tx.to || tx.from || '-'}</TableCell>
            <TableCell>{tx.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}