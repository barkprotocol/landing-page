"use client";

import React, { useState, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { getProposals, getRealmInfo, Proposal as GovernanceProposal } from '@solana/spl-governance';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import Loader from "@/components/ui/loader";

interface GovernanceProposalsProps {
  realms: any[];
  wallet: WalletContextState;
  connection: Connection;
}

export function GovernanceProposals({ realms, wallet, connection }: GovernanceProposalsProps) {
  const [selectedRealm, setSelectedRealm] = useState<string | null>(null);
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedRealm) {
      fetchProposals(selectedRealm);
    }
  }, [selectedRealm]);

  const fetchProposals = async (realmPubkey: string) => {
    setLoading(true);
    try {
      const realmInfo = await getRealmInfo(connection, new PublicKey(realmPubkey));
      const proposalsData = await getProposals(connection, realmInfo.programId, realmInfo.realmId);
      setProposals(proposalsData);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch governance proposals. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (proposal: GovernanceProposal, vote: 'yes' | 'no') => {
    setLoading(true);
    try {
      // Add logic to cast the vote
      console.log(`Voted ${vote} on proposal ${proposal.pubkey.toBase58()}`);
      toast({
        title: "Vote Cast",
        description: `You voted ${vote} on the proposal.`,
      });
    } catch (error) {
      toast({
        title: "Vote Error",
        description: error instanceof Error ? error.message : "Failed to cast vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
            {loading ? (
              <Loader />
            ) : (
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
                  {proposals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">No proposals available.</TableCell>
                    </TableRow>
                  ) : (
                    proposals.map((proposal) => (
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
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
