import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Coins, Gift, Trophy, Search, Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const rewardsData = [
  { type: 'Staking', rate: '5% APY', frequency: 'Daily', eligibility: 'All MILTON holders', status: 'Active' },
  { type: 'Liquidity Provision', rate: '2% of trading fees', frequency: 'Real-time', eligibility: 'Liquidity providers', status: 'Active' },
  { type: 'Governance Participation', rate: 'Variable', frequency: 'Per proposal', eligibility: 'Governance participants', status: 'Active' },
  { type: 'Referral Program', rate: '1% of referred user\'s transactions', frequency: 'Per transaction', eligibility: 'All users', status: 'Coming Soon' },
  { type: 'Community Challenges', rate: 'Variable', frequency: 'Weekly', eligibility: 'All users', status: 'Coming Soon' },
]

export function Rewards() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredRewards, setFilteredRewards] = useState(rewardsData)

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase()
    setSearchTerm(term)
    const filtered = rewardsData.filter(reward => 
      reward.type.toLowerCase().includes(term) ||
      reward.eligibility.toLowerCase().includes(term)
    )
    setFilteredRewards(filtered)
  }

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
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">Total Rewards Distributed</h3>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Total MILTON tokens distributed as rewards in the last 30 days</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-2xl font-bold">1,000,000 MILTON</p>
              <p className="text-sm text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">Top Earner</h3>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Highest amount of MILTON tokens earned by a single user this month</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-2xl font-bold">50,000 MILTON</p>
              <p className="text-sm text-muted-foreground">Earned this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">Upcoming Reward Pool</h3>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Total MILTON tokens allocated for next month's community challenges</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-2xl font-bold">500,000 MILTON</p>
              <p className="text-sm text-muted-foreground">For next month's challenges</p>
            </CardContent>
          </Card>
        </div>
        <div className="mb-4">
          <Label htmlFor="search">Search Rewards</Label>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              id="search"
              type="text"
              placeholder="Search by type or eligibility"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
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
            {filteredRewards.map((reward, index) => (
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
        {filteredRewards.length === 0 && (
          <p className="text-center text-muted-foreground mt-4">No rewards found matching your search.</p>
        )}
      </CardContent>
    </Card>
  )
}