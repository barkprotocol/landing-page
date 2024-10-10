'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pie, Line } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Coins, Users, Zap, Trophy, ChevronRight, ExternalLink } from 'lucide-react'
import Image from 'next/image'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title)

const tokenAllocation = {
  labels: ['Community', 'Development', 'Team', 'Liquidity', 'Ecosystem & Marketing', 'Reserve'],
  datasets: [
    {
      data: [40, 20, 10, 10, 15, 5],
      backgroundColor: [
        '#f8fafc',
        '#e2e8f0',
        '#94a3b8',
        '#475569',
        '#1e293b',
        '#020617',
      ],
      borderColor: [
        '#f1f5f9',
        '#cbd5e1',
        '#64748b',
        '#334155',
        '#0f172a',
        '#020617',
      ],
      borderWidth: 1,
    },
  ],
}

const tokenMetrics = [
  { label: 'Total Supply', value: '1,000,000,000 MILTON' },
  { label: 'Initial Circulating Supply', value: '400,000,000 MILTON' },
  { label: 'Initial Market Cap', value: '$4,000,000' },
  { label: 'Initial Token Price', value: '$0.01' },
  { label: 'Token Type', value: 'SPL (Solana)' },
  { label: 'Decimals', value: '9' },
]

const tokenUtility = [
  { title: 'Governance', description: 'Participate in community decisions and vote on meme proposals', icon: Users },
  { title: 'Staking', description: 'Earn rewards by staking MILTON tokens in our meme farms', icon: Coins },
  { title: 'NFT Marketplace', description: 'Use MILTON to buy, sell, and trade exclusive meme NFTs', icon: Zap },
  { title: 'Meme Contests', description: 'Enter meme creation contests with MILTON token prizes', icon: Trophy },
]

const emissionSchedule = {
  labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
  datasets: [
    {
      label: 'Token Emission',
      data: [400000000, 600000000, 750000000, 850000000, 1000000000],
      borderColor: '#334155',
      backgroundColor: 'rgba(51, 65, 85, 0.2)',
      tension: 0.1,
      fill: true,
    },
  ],
}

const tokenDetails = [
  { attribute: 'Token Name', value: 'Milton' },
  { attribute: 'Token Symbol', value: 'MILTON' },
  { attribute: 'Blockchain', value: 'Solana' },
  { attribute: 'Token Standard', value: 'SPL' },
  { attribute: 'Max Supply', value: '1,000,000,000 MILTON' },
  { attribute: 'Initial Circulating Supply', value: '400,000,000 MILTON' },
  { attribute: 'Decimals', value: '9' },
  { attribute: 'Contract Address', value: 'Coming soon' },
]

const dexList = [
  { name: 'Raydium', url: 'https://raydium.io/swap/?inputCurrency=sol&outputCurrency=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&fixed=in', icon: '/images/icons/raydium.svg' },
  { name: 'Orca', url: 'https://www.orca.so/swap?inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&outputMint=Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', icon: '/images/icons/orca.svg' },
  { name: 'Jupiter', url: 'https://jup.ag/swap/USDC-MILTON', icon: '/images/icons/jupiter.svg' },
  { name: 'Meteora', url: 'https://meteora.io/market/MILTON-USDC', icon: '/images/icons/meteora.svg' },
]

export default function Tokenomics() {
  const [activeTab, setActiveTab] = useState('allocation')

  return (
    <section id="tokenomics" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Tokenomics</h2>
          <p className="text-xl text-gray-600">Understand the meme-powered economics behind MILTON</p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="inline-flex h-12 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full max-w-4xl">
              {['Allocation', 'Metrics', 'Utility', 'Emission', 'Details', 'DEX'].map((tab) => (
                <TabsTrigger
                  key={tab.toLowerCase()}
                  value={tab.toLowerCase()}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex-1"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="allocation" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Token Allocation</CardTitle>
                    <CardDescription>Distribution of the total token supply</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                      <div className="w-full max-w-md">
                        <Pie 
                          data={tokenAllocation} 
                          options={{ 
                            responsive: true, 
                            maintainAspectRatio: true,
                            plugins: {
                              legend: {
                                display: false,
                              },
                              tooltip: {
                                callbacks: {
                                  label: (context) => {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    return `${label}: ${value}%`;
                                  },
                                },
                              },
                            },
                          }} 
                        />
                      </div>
                      <div className="w-full max-w-sm">
                        <h4 className="text-lg font-semibold mb-4">Allocation Breakdown</h4>
                        <ul className="space-y-2">
                          {tokenAllocation.labels.map((label, index) => (
                            <li key={label} className="flex items-center justify-between text-sm">
                              <span className="flex items-center">
                                <span 
                                  className="w-3 h-3 rounded-full mr-2" 
                                  style={{ backgroundColor: tokenAllocation.datasets[0].backgroundColor[index] }}
                                ></span>
                                {label}
                              </span>
                              <span className="font-semibold">{tokenAllocation.datasets[0].data[index]}%</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Token Metrics</CardTitle>
                    <CardDescription>Key figures about MILTON token</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {tokenMetrics.map((metric, index) => (
                        <li key={index} className="flex justify-between items-center border-b pb-2">
                          <span className="font-medium text-gray-600">{metric.label}</span>
                          <span className="text-primary font-bold">{metric.value}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="utility" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Token Utility</CardTitle>
                    <CardDescription>Ways to use your MILTON tokens</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {tokenUtility.map((item, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center">
                              <item.icon className="mr-2 h-5 w-5 text-primary" />
                              {item.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600">{item.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="emission" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Token Emission Schedule</CardTitle>
                    <CardDescription>Projected token release over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full h-64">
                      <Line 
                        data={emissionSchedule} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: 'Total Circulating Supply'
                              }
                            },
                            x: {
                              title: {
                                display: true,
                                text: 'Time'
                              }
                            }
                          }
                        }} 
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Token Details</CardTitle>
                    <CardDescription>Comprehensive information about MILTON token</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Attribute</TableHead>
                          <TableHead>Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tokenDetails.map((detail, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{detail.attribute}</TableCell>
                            <TableCell>{detail.value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="dex" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Decentralized Exchanges</CardTitle>
                    <CardDescription>Where to trade MILTON tokens</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {dexList.map((dex, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center justify-between">
                              <div className="flex items-center">
                                <Image
                                  src={dex.icon}
                                  alt={`${dex.name} icon`}
                                  width={24}
                                  height={24}
                                  className="mr-2"
                                />
                                {dex.name}
                              </div>
                              <a
                                href={dex.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 transition-colors"
                              >
                                <ExternalLink className="h-5 w-5" />
                              </a>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Button
                              asChild
                              variant="outline"
                              className="w-full"
                            >
                              <a
                                
                                href={dex.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Trade on {dex.name}
                              </a>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 text-center"
        >
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white group">
            Buy MILTON Tokens
            <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}