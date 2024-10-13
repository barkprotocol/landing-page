import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Users, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Claim } from './claim'

const airdropData = [
  {
    name: 'Q4 2024 Community Engagement',
    date: 'Dec 1, 2024',
    eligibility: 'Active community members',
    amount: '500,000 MILTON',
    status: 'Upcoming',
  },
  {
    name: 'Q1 2025 Governance Participation',
    date: 'Jan 1, 2025',
    eligibility: 'Governance participants',
    amount: '750,000 MILTON',
    status: 'Upcoming',
  },
  {
    name: 'Q2 2025 DeFi Integration',
    date: 'Apr 1, 2025',
    eligibility: 'Users who integrated with partner DeFi protocols',
    amount: '1,000,000 MILTON',
    status: 'Upcoming',
  },
  {
    name: 'Q3 2025 NFT Holders',
    date: 'Jul 1, 2025',
    eligibility: 'MILTON NFT holders',
    amount: '500,000 MILTON',
    status: 'Upcoming',
  },
]

export function Airdrops() {
  const [claimModalOpen, setClaimModalOpen] = React.useState(false)
  const [selectedAirdrop, setSelectedAirdrop] = React.useState<typeof airdropData[0] | null>(null)

  const handleClaimClick = (airdrop: typeof airdropData[0]) => {
    setSelectedAirdrop(airdrop)
    setClaimModalOpen(true)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">MILTON Airdrops</CardTitle>
        <CardDescription>Upcoming token distribution events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Next Airdrop</h3>
              </div>
              <p className="text-2xl font-bold">Oct 1, 2024</p>
              <p className="text-sm text-muted-foreground">Q4 2024 Community Engagement</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Estimated Recipients</h3>
              </div>
              <p className="text-2xl font-bold">50,000+</p>
              <p className="text-sm text-muted-foreground">For upcoming airdrops</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Total to be Airdropped</h3>
              </div>
              <p className="text-2xl font-bold">2,750,000 MILTON</p>
              <p className="text-sm text-muted-foreground">Across all planned airdrops</p>
            </CardContent>
          </Card>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Airdrop Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Eligibility</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {airdropData.map((airdrop, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{airdrop.name}</TableCell>
                <TableCell>{airdrop.date}</TableCell>
                <TableCell>{airdrop.eligibility}</TableCell>
                <TableCell>{airdrop.amount}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      airdrop.status === 'Completed'
                        ? 'default'
                        : airdrop.status === 'Ongoing'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {airdrop.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleClaimClick(airdrop)}
                    disabled={airdrop.status !== 'Ongoing'}
                  >
                    Claim
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      {selectedAirdrop && (
        <Claim
          isOpen={claimModalOpen}
          onClose={() => setClaimModalOpen(false)}
          airdrop={selectedAirdrop}
        />
      )}
    </Card>
  )
}