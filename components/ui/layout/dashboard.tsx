'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Wallet, Zap, Trophy, Heart, Gift, Coins, ShoppingCart, Vote, BarChart2, Globe, TrendingUp, Users, Sparkles, Cpu } from 'lucide-react'

const useCases = [
  { 
    title: 'Governance', 
    icon: Vote, 
    description: 'Participate in community decisions and vote on proposals.',
    action: 'View Proposals',
    stats: { total: 15, active: 3 }
  },
  { 
    title: 'Staking', 
    icon: Coins, 
    description: 'Earn rewards by staking MILTON tokens in our meme farms.',
    action: 'Stake Now',
    stats: { apy: '12%', totalStaked: '500M MILTON' }
  },
  { 
    title: 'NFT Marketplace', 
    icon: ShoppingCart, 
    description: 'Buy, sell, and trade exclusive meme NFTs using MILTON.',
    action: 'Explore NFTs',
    stats: { totalNFTs: 1000, floorPrice: '50 MILTON' }
  },
  { 
    title: 'Meme Contests', 
    icon: Trophy, 
    description: 'Enter meme creation contests with MILTON token prizes.',
    action: 'Join Contest',
    stats: { activeContests: 2, prizePool: '100K MILTON' }
  },
  { 
    title: 'Disaster Relief', 
    icon: Heart, 
    description: 'Contribute to disaster relief efforts using MILTON tokens.',
    action: 'Donate Now',
    stats: { totalRaised: '1M MILTON', activeCampaigns: 3 }
  },
  { 
    title: 'Charitable Donations', 
    icon: Gift, 
    description: 'Make donations to verified global causes with MILTON.',
    action: 'Choose Cause',
    stats: { totalDonated: '5M MILTON', causes: 20 }
  }
]

const functions = [
  {
    title: 'Meme Generator',
    icon: Sparkles,
    description: 'Create hilarious memes using MILTON-powered AI.',
    action: 'Generate Meme',
    stats: { generated: 10000, trending: 5 }
  },
  {
    title: 'Solana Blinks',
    icon: Zap,
    description: 'Experience lightning-fast microtransactions with Solana Blinks.',
    action: 'Try Blinks',
    stats: { totalBlinks: '1M', avgSpeed: '400ms' }
  },
  {
    title: 'MILTON Bot',
    icon: Cpu,
    description: 'Interact with our AI-powered MILTON assistant for token info and meme creation.',
    action: 'Chat Now',
    stats: { activeUsers: 5000, queriesAnswered: '100K' }
  }
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">MILTON Dashboard</h1>
          <p className="text-xl text-muted-foreground">Explore the power of MILTON across the Solana ecosystem</p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 gap-4">
            {['Overview', 'Wallet', 'Governance', 'Staking', 'NFTs', 'Charity', 'Functions'].map((tab) => (
              <TabsTrigger key={tab} value={tab.toLowerCase()} className="w-full">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Wallet className="mr-2 h-5 w-5 text-primary" />
                      MILTON Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">1,234,567 MILTON</p>
                    <p className="text-sm text-muted-foreground">≈ $12,345.67 USD</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">View Transactions</Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                      MILTON Price
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">$0.01 USD</p>
                    <p className="text-sm text-green-500">+5.67% (24h)</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Trade MILTON</Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5 text-primary" />
                      Community Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">1,000,000+</p>
                    <p className="text-sm text-muted-foreground">MILTON holders</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Join Community</Button>
                  </CardFooter>
                </Card>
              </div>

              <h2 className="text-2xl font-bold mt-12 mb-6">MILTON Use Cases</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {useCases.map((useCase) => (
                  <motion.div
                    key={useCase.title}
                    onHoverStart={() => setHoveredCard(useCase.title)}
                    onHoverEnd={() => setHoveredCard(null)}
                  >
                    <Card className="h-full flex flex-col justify-between hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                      <CardHeader>
                        <CardTitle className="flex items-center text-xl font-semibold">
                          <useCase.icon className="mr-2 h-6 w-6 text-primary" />
                          {useCase.title}
                        </CardTitle>
                        <CardDescription>{useCase.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <AnimatePresence>
                          {hoveredCard === useCase.title && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="mt-4"
                            >
                              {Object.entries(useCase.stats).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center mb-2">
                                  <span className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                  <span className="font-semibold">{value}</span>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                      <CardFooter className="flex justify-between items-center mt-auto">
                        <Button variant="outline" size="sm">
                          {useCase.action}
                        </Button>
                        <Badge variant="secondary">MILTON</Badge>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <h2 className="text-2xl font-bold mt-12 mb-6">MILTON Functions & Solana Blinks</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {functions.map((func) => (
                  <motion.div
                    key={func.title}
                    onHoverStart={() => setHoveredCard(func.title)}
                    onHoverEnd={() => setHoveredCard(null)}
                  >
                    <Card className="h-full flex flex-col justify-between hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                      <CardHeader>
                        <CardTitle className="flex items-center text-xl font-semibold">
                          <func.icon className="mr-2 h-6 w-6 text-primary" />
                          {func.title}
                        </CardTitle>
                        <CardDescription>{func.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <AnimatePresence>
                          {hoveredCard === func.title && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="mt-4"
                            >
                              {Object.entries(func.stats).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center mb-2">
                                  <span className="text-sm text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                  <span className="font-semibold">{value}</span>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                      <CardFooter className="flex justify-between items-center mt-auto">
                        <Button variant="outline" size="sm">
                          {func.action}
                        </Button>
                        <Badge variant="secondary">MILTON</Badge>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>

        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>© 2024 MILTON. All rights reserved. Powered by Solana.</p>
        </footer>
      </div>
    </div>
  )
}