import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Coins, Gift, Trophy } from 'lucide-react'

const rewardsData = [
  { type: 'Staking', rate: '5% APY', frequency: 'Daily', eligibility: 'All MILTON holders', status: 'Active' },
  { type: 'Liquidity Provision', rate: '2% of trading fees', frequency: 'Real-time', eligibility: 'Liquidity providers', status: 'Active' },
  { type: 'Governance Participation', rate: 'Variable', frequency: 'Per proposal', eligibility: 'Governance participants', status: 'Active' },
  { type: 'Referral Program', rate: '1% of referred user\'s transactions', frequency: 'Per transaction', eligibility: 'All users', status: 'Coming Soon' },
  { type: 'Community Challenges', rate: 'Variable', frequency: 'Weekly', eligibility: 'All users', status: 'Coming Soon' },
]

export function Rewards() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">MILTON Rewards Program</CardTitle>
        <CardDescription>Earn rewards by participating in the MILTON ecosystem</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Total Rewards Distributed</h3>
              </div>
              <p className="text-2xl font-bold">1,000,000 MILTON</p>
              <p className="text-sm text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Top Earner</h3>
              </div>
              <p className="text-2xl font-bold">50,000 MILTON</p>
              <p className="text-sm text-muted-foreground">Earned this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Upcoming Reward Pool</h3>
              </div>
              <p className="text-2xl font-bold">500,000 MILTON</p>
              <p className="text-sm text-muted-foreground">For next month's challenges</p>
            </CardContent>
          </Card>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reward Type</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Eligibility</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rewardsData.map((reward, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{reward.type}</TableCell>
                <TableCell>{reward.rate}</TableCell>
                <TableCell>{reward.frequency}</TableCell>
                <TableCell>{reward.eligibility}</TableCell>
                <TableCell>
                  <Badge
                    variant={reward.status === 'Active' ? 'default' : 'secondary'}
                  >
                    {reward.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}