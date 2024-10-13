import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Wallet, ShoppingCart, Coins, Users, Zap, Lock } from 'lucide-react'

const useCases = [
  {
    title: 'Payments',
    icon: <Wallet className="h-6 w-6" />,
    description: 'Use MILTON tokens for fast and secure payments across the platform.',
    examples: ['Peer-to-peer transfers', 'Merchant payments', 'Cross-border transactions'],
  },
  {
    title: 'E-commerce',
    icon: <ShoppingCart className="h-6 w-6" />,
    description: 'Integrate MILTON tokens into online marketplaces and shops.',
    examples: ['Discounts for token holders', 'Loyalty programs', 'Exclusive product access'],
  },
  {
    title: 'DeFi',
    icon: <Coins className="h-6 w-6" />,
    description: 'Participate in decentralized finance activities with MILTON.',
    examples: ['Yield farming', 'Liquidity provision', 'Collateralized lending'],
  },
  {
    title: 'Governance',
    icon: <Users className="h-6 w-6" />,
    description: 'Use MILTON tokens to participate in platform governance.',
    examples: ['Proposal voting', 'Parameter adjustments', 'Fund allocation decisions'],
  },
  {
    title: 'Utility',
    icon: <Zap className="h-6 w-6" />,
    description: 'Access various platform features and services using MILTON.',
    examples: ['Premium content access', 'Reduced fees', 'Enhanced API limits'],
  },
  {
    title: 'Staking',
    icon: <Lock className="h-6 w-6" />,
    description: 'Stake MILTON tokens to earn rewards and secure the network.',
    examples: ['Passive income generation', 'Validator node operation', 'Governance weight'],
  },
]

export function UseCases() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">MILTON Token Use Cases</CardTitle>
        <CardDescription>Explore the various applications of MILTON tokens within our ecosystem</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="payments" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            {useCases.map((useCase) => (
              <TabsTrigger key={useCase.title.toLowerCase()} value={useCase.title.toLowerCase()}>
                {useCase.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {useCases.map((useCase) => (
            <TabsContent key={useCase.title.toLowerCase()} value={useCase.title.toLowerCase()}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {useCase.icon}
                    {useCase.title}
                  </CardTitle>
                  <CardDescription>{useCase.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-2">Examples:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {useCase.examples.map((example, index) => (
                      <li key={index}>{example}</li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <Badge variant="outline" className="mr-2">Real-world use case</Badge>
                    <Badge variant="outline">Active development</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}