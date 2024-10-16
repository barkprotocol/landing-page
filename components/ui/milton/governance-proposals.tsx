import React, { useState, useEffect } from 'react'
import { Connection, PublicKey } from '@solana/web3.js'
import { getRealmInfo, getProposal, Proposal as GovernanceProposal, ProposalState, VoteRecord, getVoteRecordsByVoter } from '@solana/spl-governance'
import { WalletContextState } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CustomGovernanceProposal {
  pubkey: PublicKey
  account: {
    name: string
    descriptionLink: string
    state: ProposalState
    votingAt: Date | null
    votingCompletedAt: Date | null
  }
}

interface GovernanceProposalsProps {
  realms: { pubkey: PublicKey; account: { name: string } }[]
  wallet: WalletContextState
  connection: Connection
}

export function GovernanceProposals({ realms, wallet, connection }: GovernanceProposalsProps) {
  const [selectedRealm, setSelectedRealm] = useState<string | null>(null)
  const [proposals, setProposals] = useState<CustomGovernanceProposal[]>([])
  const [loading, setLoading] = useState(false)
  const [votingInProgress, setVotingInProgress] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (selectedRealm) {
      fetchProposals(selectedRealm)
    }
  }, [selectedRealm, connection])

  const fetchProposals = async (realmPubkey: string) => {
    setLoading(true)
    try {
      const realmInfo = await getRealmInfo(connection, new PublicKey(realmPubkey))
      const proposalKeys = realmInfo.governances.flatMap(gov => gov.account.proposals || [])

      const proposalsData = await Promise.all(
        proposalKeys.map(async (pubkey) => {
          const proposal = await getProposal(connection, pubkey)
          return {
            pubkey,
            account: {
              name: proposal.account.name,
              descriptionLink: proposal.account.descriptionLink || '',
              state: proposal.account.state,
              votingAt: proposal.account.votingAt ? new Date(proposal.account.votingAt.toNumber() * 1000) : null,
              votingCompletedAt: proposal.account.votingCompletedAt ? new Date(proposal.account.votingCompletedAt.toNumber() * 1000) : null,
            },
          } as CustomGovernanceProposal
        })
      )

      setProposals(proposalsData)
    } catch (error) {
      console.error('Error fetching proposals:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch governance proposals. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (proposal: CustomGovernanceProposal, vote: 'yes' | 'no') => {
    if (!wallet.publicKey) {
      toast({
        title: "Error",
        description: "Please connect your wallet to vote.",
        variant: "destructive",
      })
      return
    }

    setVotingInProgress(proposal.pubkey.toBase58())
    try {
      // Check if the user has already voted
      const voteRecords = await getVoteRecordsByVoter(connection, proposal.pubkey, wallet.publicKey)
      if (voteRecords.length > 0) {
        toast({
          title: "Already Voted",
          description: "You have already cast a vote for this proposal.",
          variant: "warning",
        })
        return
      }

      // Implement actual voting logic here
      // This is a placeholder for the actual voting transaction
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulating transaction time

      toast({
        title: "Vote Cast",
        description: `You voted ${vote} on the proposal "${proposal.account.name}".`,
      })

      // Refresh proposals after voting
      await fetchProposals(selectedRealm!)
    } catch (error) {
      console.error('Error casting vote:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cast vote. Please try again.",
        variant: "destructive",
      })
    } finally {
      setVotingInProgress(null)
    }
  }

  const getProposalStateColor = (state: ProposalState) => {
    switch (state) {
      case ProposalState.Draft:
        return 'bg-yellow-500'
      case ProposalState.SigningOff:
        return 'bg-blue-500'
      case ProposalState.Voting:
        return 'bg-green-500'
      case ProposalState.Succeeded:
        return 'bg-green-700'
      case ProposalState.Executing:
        return 'bg-purple-500'
      case ProposalState.Completed:
        return 'bg-gray-500'
      case ProposalState.Cancelled:
        return 'bg-red-500'
      case ProposalState.Defeated:
        return 'bg-red-700'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-4">
      <Select onValueChange={setSelectedRealm}>
        <SelectTrigger className="w-[200px]">
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
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Voting Period</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proposals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">No proposals available.</TableCell>
                    </TableRow>
                  ) : (
                    proposals.map((proposal) => (
                      <TableRow key={proposal.pubkey.toBase58()}>
                        <TableCell>
                          {proposal.account.name}
                          {proposal.account.descriptionLink && (
                            <a href={proposal.account.descriptionLink} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:underline">
                              Details
                            </a>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getProposalStateColor(proposal.account.state)}`}>
                            {proposal.account.state.toString()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {proposal.account.votingAt && proposal.account.votingCompletedAt ? (
                            <>
                              {proposal.account.votingAt.toLocaleDateString()} - {proposal.account.votingCompletedAt.toLocaleDateString()}
                            </>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleVote(proposal, 'yes')}
                              size="sm"
                              disabled={proposal.account.state !== ProposalState.Voting || votingInProgress === proposal.pubkey.toBase58()}
                            >
                              {votingInProgress === proposal.pubkey.toBase58() ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : null}
                              Vote Yes
                            </Button>
                            <Button
                              onClick={() => handleVote(proposal, 'no')}
                              size="sm"
                              variant="outline"
                              disabled={proposal.account.state !== ProposalState.Voting || votingInProgress === proposal.pubkey.toBase58()}
                            >
                              Vote No
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}