import React, { useState, useEffect } from 'react'
import { Connection, PublicKey } from '@solana/web3.js'
import { getProposals, getRealmInfo, Proposal } from '@solana/spl-governance'
import { WalletContextState } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"

interface GovernanceProposalsProps {
  realms: any[]
  wallet: WalletContextState
  connection: Connection
}

export function GovernanceProposals({ realms, wallet, connection }: GovernanceProposalsProps) {
  const [selectedRealm, setSelectedRealm] = useState<string | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>([])

  useEffect(() => {
    if (selectedRealm) {
      fetchProposals(selectedRealm)
    }
  }, [selectedRealm])

  const fetchProposals = async (realmPubkey: string) => {
    try {
      const realmInfo = await getRealmInfo(connection, new PublicKey(realmPubkey))
      const proposalsData = await getProposals(connection, realmInfo.programId, realmInfo.realmId)
      setProposals(proposalsData)
    } catch (error) {
      console.error('Error fetching proposals:', error)
      toast({
        title: "Error",
        description: "Failed to fetch governance proposals. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleVote = async (proposal: Proposal, vote: 'yes' | 'no') => {
    // Implement voting logic here
    console.log(`Voted ${vote} on proposal ${proposal.pubkey.toBase58()}`)
    toast({
      title: "Vote Cast",
      description: `You voted ${vote} on the proposal.`,
    })
  }

  return (
    <div className="space-y-4">
      <Select onValueChange={setSelectedRealm}>
        <SelectTrigger>
          <SelectValue placeholder="Select a realm" />
        </SelectTrigger>
        <SelectContent>
          {realms.map((realm) => (
            <SelectItem key={realm.pubkey.toBase58()} value={realm.pubkey.toBase58()}>
              {realm.account.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedRealm && (
        <Card>
          <CardHeader>
            <CardTitle>Active Proposals</CardTitle>
            <CardDescription>Vote on current governance proposals</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((proposal) => (
                  <TableRow key={proposal.pubkey.toBase58()}>
                    <TableCell>{proposal.account.name}</TableCell>
                    <TableCell>{proposal.account.descriptionLink}</TableCell>
                    <TableCell>{proposal.account.state}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button onClick={() => handleVote(proposal, 'yes')} size="sm">Vote Yes</Button>
                        <Button onClick={() => handleVote(proposal, 'no')} size="sm" variant="outline">Vote No</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}