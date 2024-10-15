import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

const activeProposals = [
  { id: 1, title: 'Increase Staking Rewards', forVotes: 65, againstVotes: 35, endDate: '2023-06-20' },
  { id: 2, title: 'Add New Token Pair to DEX', forVotes: 78, againstVotes: 22, endDate: '2023-06-22' },
  { id: 3, title: 'Modify Governance Voting Period', forVotes: 45, againstVotes: 55, endDate: '2023-06-25' },
]

export function GovernanceSnapshot() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Proposal</TableHead>
          <TableHead>Votes</TableHead>
          <TableHead>End Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activeProposals.map((proposal) => (
          <TableRow key={proposal.id}>
            <TableCell>{proposal.title}</TableCell>
            <TableCell>
              <div className="space-y-2">
                <Progress value={proposal.forVotes} className="w-full" />
                <div className="text-sm text-muted-foreground">
                  For: {proposal.forVotes}% | Against: {proposal.againstVotes}%
                </div>
              </div>
            </TableCell>
            <TableCell>{proposal.endDate}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}