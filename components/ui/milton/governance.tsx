import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, VoteIcon, Users, BarChart } from 'lucide-react';

interface Proposal {
  id: number;
  title: string;
  description: string;
  status: 'Active' | 'Passed' | 'Failed' | 'Pending';
  votes: {
    for: number;
    against: number;
  };
}

const proposalsData: Proposal[] = [
  { id: 1, title: 'Increase staking rewards', description: 'Proposal to increase staking rewards from 5% to 7% APY', status: 'Active', votes: { for: 1500000, against: 500000 } },
  { id: 2, title: 'Add new liquidity pool', description: 'Add MILTON/ETH liquidity pool on major DEX', status: 'Passed', votes: { for: 2000000, against: 300000 } },
  { id: 3, title: 'Reduce transaction fees', description: 'Reduce platform transaction fees from 0.1% to 0.05%', status: 'Failed', votes: { for: 800000, against: 1200000 } },
  { id: 4, title: 'Launch mobile app', description: 'Allocate funds for developing a MILTON mobile app', status: 'Pending', votes: { for: 0, against: 0 } },
];

export function Governance() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>(proposalsData);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = proposalsData.filter(proposal =>
      proposal.title.toLowerCase().includes(term) ||
      proposal.description.toLowerCase().includes(term)
    );
    setFilteredProposals(filtered);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">MILTON Governance</CardTitle>
        <CardDescription>Participate in shaping the future of MILTON</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <VoteIcon className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Active Proposals</h3>
              </div>
              <p className="text-2xl font-bold">{filteredProposals.filter(p => p.status === 'Active').length}</p>
              <p className="text-sm text-muted-foreground">Open for voting</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Total Participants</h3>
              </div>
              <p className="text-2xl font-bold">15,423</p>
              <p className="text-sm text-muted-foreground">Unique voters</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <BarChart className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Voting Power</h3>
              </div>
              <p className="text-2xl font-bold">5,000,000 MILTON</p>
              <p className="text-sm text-muted-foreground">Total staked for voting</p>
            </CardContent>
          </Card>
        </div>
        <div className="mb-4">
          <Label htmlFor="search">Search Proposals</Label>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              id="search"
              type="text"
              placeholder="Search by title or description"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Button type="button" size="icon" onClick={() => handleSearch({ target: { value: searchTerm } } as React.ChangeEvent<HTMLInputElement>)}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Votes For</TableHead>
              <TableHead>Votes Against</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProposals.map((proposal) => (
              <TableRow key={proposal.id} className="hover:bg-gray-100">
                <TableCell>{proposal.id}</TableCell>
                <TableCell className="font-medium">{proposal.title}</TableCell>
                <TableCell>{proposal.description}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      proposal.status === 'Active' ? 'default' :
                      proposal.status === 'Passed' ? 'success' :
                      proposal.status === 'Failed' ? 'destructive' : 'secondary'
                    }
                  >
                    {proposal.status}
                  </Badge>
                </TableCell>
                <TableCell>{proposal.votes.for.toLocaleString()}</TableCell>
                <TableCell>{proposal.votes.against.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredProposals.length === 0 && (
          <p className="text-center text-muted-foreground mt-4">No proposals found matching your search.</p>
        )}
      </CardContent>
    </Card>
  );
}
