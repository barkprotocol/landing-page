'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Gavel, Users, VoteIcon, PlusCircle } from 'lucide-react'

// Note: This is a mock function. In a real application, you would integrate with Solana Realm SDK
const mockSubmitProposal = async (title: string, description: string) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  return { success: true, message: 'Proposal submitted successfully' }
}

export function Governance() {
  const [activeTab, setActiveTab] = useState('proposals')
  const [proposalTitle, setProposalTitle] = useState('')
  const [proposalDescription, setProposalDescription] = useState('')
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await mockSubmitProposal(proposalTitle, proposalDescription)
      if (result.success) {
        setSubmitMessage({ type: 'success', text: result.message })
        setProposalTitle('')
        setProposalDescription('')
      }
    } catch (error) {
      setSubmitMessage({ type: 'error', text: 'Failed to submit proposal. Please try again.' })
    }
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl flex items-center">
          <Gavel className="mr-2 h-6 w-6" />
          MILTON Governance
        </CardTitle>
        <CardDescription>Participate in the decision-making process for the MILTON ecosystem</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
            <TabsTrigger value="proposals">Active Proposals</TabsTrigger>
            <TabsTrigger value="create">Create Proposal</TabsTrigger>
            <TabsTrigger value="vote">Vote</TabsTrigger>
          </TabsList>
          <TabsContent value="proposals">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Current Active Proposals</h3>
              <ul className="space-y-2">
                <li className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                  <span>Proposal 1: Increase staking rewards</span>
                  <Button variant="outline" size="sm">View Details</Button>
                </li>
                <li className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                  <span>Proposal 2: Add new meme contest category</span>
                  <Button variant="outline" size="sm">View Details</Button>
                </li>
              </ul>
            </div>
          </TabsContent>
          <TabsContent value="create">
            <form onSubmit={handleSubmitProposal} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="proposal-title">Proposal Title</Label>
                <Input
                  id="proposal-title"
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  placeholder="Enter proposal title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proposal-description">Proposal Description</Label>
                <textarea
                  id="proposal-description"
                  value={proposalDescription}
                  onChange={(e) => setProposalDescription(e.target.value)}
                  placeholder="Describe your proposal"
                  className="w-full min-h-[100px] p-2 rounded-md border border-input bg-background"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Submit Proposal
              </Button>
            </form>
            {submitMessage && (
              <Alert className={`mt-4 ${submitMessage.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                <AlertTitle>{submitMessage.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
                <AlertDescription>{submitMessage.text}</AlertDescription>
              </Alert>
            )}
          </TabsContent>
          <TabsContent value="vote">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Cast Your Vote</h3>
              <p className="text-sm text-muted-foreground">Connect your wallet to view and vote on active proposals.</p>
              <Button className="w-full">
                <Users className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
              <div className="p-4 bg-secondary/50 rounded-lg">
                <h4 className="font-medium mb-2">How Voting Works</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Each MILTON token represents one vote</li>
                  <li>Proposals require a majority to pass</li>
                  <li>Voting period lasts for 7 days</li>
                  <li>Results are executed automatically via smart contract</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}