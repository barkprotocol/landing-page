'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Coins, Users, Zap, Trophy, ChevronRight, ExternalLink, Heart, Gift, Calculator, Info, PieChart, BarChart, Lightbulb, TrendingUp, LayoutGrid, Banknote, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Pie, Line } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js'
import Link from 'next/link'
import TokenSales from './token-sale'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title)

const tokenAllocation = {
  labels: ['Community', 'Development', 'Team', 'Liquidity', 'Ecosystem & Marketing', 'Reserve'],
  datasets: [
    {
      data: [40, 20, 10, 10, 15, 5],
      backgroundColor: [
        '#f8fafc', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569'
      ],
      borderColor: [
        '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155'
      ],
      borderWidth: 2,
    },
  ],
}

const initialTokenMetrics = [
  { label: 'Max Supply', value: '18,446,000,000 MILTON', description: 'The maximum number of MILTON tokens that will ever exist.' },
  { label: 'Initial Circulating Supply', value: '7,378,400,000 MILTON', description: 'The number of MILTON tokens available for trading at launch.' },
  { label: 'Initial Market Cap', value: '$73,784', description: 'The total value of circulating MILTON tokens at launch.' },
  { label: 'Initial Token Price', value: '$0.00001', description: 'The price of one MILTON token at launch.' },
  { label: 'Token Type', value: 'SPL (Solana)', description: 'MILTON is a Solana Program Library token, ensuring fast and low-cost transactions.' },
  { label: 'Decimals', value: '9', description: 'The number of decimal places for MILTON token amounts.' },
]

const tokenUtility = [
  { title: 'Governance', description: 'Participate in community decisions and vote on meme proposals', icon: Users },
  { title: 'Staking', description: 'Earn rewards by staking MILTON tokens in our meme farms', icon: Coins },
  { title: 'NFT Marketplace', description: 'Use MILTON to buy, sell, and trade exclusive meme NFTs', icon: Zap },
  { title: 'Meme Contests', description: 'Enter meme creation contests with MILTON token prizes', icon: Trophy },
  { title: 'Disaster Relief', description: 'Contribute to disaster relief efforts using MILTON tokens', icon: Heart },
  { title: 'Charitable Donations', description: 'Make donations to verified global causes with MILTON', icon: Gift },
]

const emissionSchedule = {
  labels: ['Initial', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
  datasets: [
    {
      label: 'Circulating Supply',
      data: [7378400000, 10132800000, 12887200000, 14720000000, 16552800000, 18446000000],
      borderColor: '#64748b',
      backgroundColor: 'rgba(100, 116, 139, 0.2)',
      tension: 0.1,
      fill: true,
    },
    {
      label: 'Max Supply',
      data: [18446000000, 18446000000, 18446000000, 18446000000, 18446000000, 18446000000],
      borderColor: '#94a3b8',
      backgroundColor: 'rgba(148, 163, 184, 0.2)',
      tension: 0.1,
      fill: true,
    }
  ],
}

const tokenDetails = [
  { attribute: 'Token Name', value: 'MILTON' },
  { attribute: 'Token Symbol', value: 'MILTON' },
  { attribute: 'Decimals', value: '9' },
  { attribute: 'Blockchain', value: 'Solana' },
  { attribute: 'Token Standard', value: 'SPL' },
  { attribute: 'Max Supply', value: '18,446,000,000 MILTON' },
  { attribute: 'Initial Circulating Supply', value: '7,378,400,000 MILTON' },
  { attribute: 'Burn Rate', value: '1.5% Quarterly', description: 'Percentage of tokens burned every quarter to reduce supply' },
  { attribute: 'Contract Address', value: 'Coming soon' },
]

const dexList = [
  { name: 'Raydium', url: 'https://raydium.io/swap/?inputCurrency=sol&outputCurrency=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&fixed=in', icon: '/images/icons/raydium.svg' },
  { name: 'Orca', url: 'https://www.orca.so/swap?inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&outputMint=Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', icon: '/images/icons/orca.svg' },
  { name: 'Jupiter', url: 'https://jup.ag/swap/USDC-MILTON', icon: '/images/icons/jupiter.svg' },
  { name: 'Meteora', url: 'https://meteora.io/market/MILTON-USDC', icon: '/images/icons/meteora.svg' },
]

export default function Tokenomics() {
  const [activeTab, setActiveTab] = useState('details')
  const [tokenMetrics, setTokenMetrics] = useState(initialTokenMetrics)
  const [currentPrice, setCurrentPrice] = useState(0.00001)
  const [circulatingSupply, setCirculatingSupply] = useState(7378400000)

  useEffect(() => {
    updateMetrics()
  }, [currentPrice, circulatingSupply])

  const updateMetrics = () => {
    const updatedMetrics = [...initialTokenMetrics]
    updatedMetrics[1].value = `${circulatingSupply.toLocaleString()} MILTON`
    updatedMetrics[2].value = `$${(circulatingSupply * currentPrice).toLocaleString()}`
    updatedMetrics[3].value = `$${currentPrice.toFixed(8)}`
    setTokenMetrics(updatedMetrics)
  }

  const tabs = [
    { id: 'details', label: 'Details', icon: Info },
    { id: 'allocation', label: 'Allocation', icon: PieChart },
    { id: 'metrics', label: 'Metrics', icon: BarChart },
    { id: 'utility', label: 'Utility', icon: Lightbulb },
    { id: 'emission', label: 'Emission', icon: TrendingUp },
    { id: 'dex', label: 'DEX', icon: LayoutGrid },
    { id: 'token-sale', label: 'Token Sale', icon: Banknote },
    { id: 'buy', label: 'Buy', icon: ShoppingCart },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
  ]

  return (
    <section id="tokenomics" className="py-12 sm:py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-16"
        >
          <div className="mb-4">
            <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
              Tokenomics
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 flex items-center justify-center">
            Information
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore the tokenomics and key information about MILTON, the meme-powered token on Solana
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="inline-flex h-12 items-center justify-center rounded-md bg-secondary p-1 text-secondary-foreground w-full max-w-6xl overflow-x-auto">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex-1"
                >
                  <tab.icon className="mr-2 h-4 w-4" />
                  {tab.label}
                  {tab.id === 'buy' && <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />}
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
              <TabsContent value="details" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl">MILTON Overview</CardTitle>
                    <CardDescription>The meme-powered token on Solana</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-6 flex-1">
                        <p className="text-base sm:text-lg text-muted-foreground">
                          MILTON is a community-driven meme token built on the Solana blockchain, combining the power of memes with decentralized finance and social impact. With a total supply of 18.446 billion tokens, MILTON aims to create a vibrant ecosystem where creativity, humor, financial innovation, and charitable efforts intersect.
                        </p>
                      </div>
                      <div className="ml-6 flex-shrink-0">
                        <Image
                          src="https://ucarecdn.com/137628fb-f546-490c-887a-1d0d3177f542/MiltonCard.png"
                          alt="MILTON Token Logo"
                          width={80}
                          height={80}
                          className="rounded-full shadow-lg"
                        />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <h4 className="text-lg sm:text-xl font-semibold mt-6 mb-3">Key Features:</h4>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Fast and low-cost transactions on the Solana network</li>
                        <li>Community governance for key decisions</li>
                        <li>Staking rewards for long-term holders</li>
                        <li>Integration with popular Solana DEXes for easy trading</li>
                        <li>Regular meme contests with MILTON token prizes</li>
                        <li>Transaction fees directed towards global good and charitable causes</li>
                        <li>Disaster relief and donation initiatives</li>
                        <li>Quarterly token burn of 1.5% to reduce supply over time</li>
                      </ul>
                    </div>
                    <div className="overflow-x-auto">
                      <Table className="mt-6 w-full">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-1/2">Attribute</TableHead>
                            <TableHead className="w-1/2">Value</TableHead>
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
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="allocation" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl">Allocation</CardTitle>
                    <CardDescription>Distribution of the max token supply</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                      <div className="w-full max-w-md">
                        <ChartContainer
                          config={{
                            allocation: {
                              label: 'Allocation',
                              color:  'hsl(var(--chart-1))',
                            },
                          }}
                        >
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
                                  enabled: false,
                                },
                              },
                            }} 
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </ChartContainer>
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
                    <CardTitle className="text-xl sm:text-2xl">Token Metrics</CardTitle>
                    <CardDescription>Key figures about MILTON token</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 sm:grid-cols-2">
                      {tokenMetrics.map((metric, index) => (
                        <div key={index} className="space-y-2">
                          <h3 className="text-base sm:text-lg font-semibold">{metric.label}</h3>
                          <p className="text-xl sm:text-2xl font-bold text-primary">{metric.value}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">{metric.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="utility" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl">Utility</CardTitle>
                    <CardDescription>Ways to use your MILTON tokens</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-8">
                      <h3 className="text-lg sm:text-xl font-semibold mb-3">MILTON's Commitment to Global Good</h3>
                      <p className="text-base sm:text-lg text-muted-foreground">
                        A portion of all transaction fees is allocated to charitable causes and global initiatives, making every MILTON transaction a step towards positive change.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {tokenUtility.map((item, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                          <CardHeader>
                            <CardTitle className="text-base sm:text-lg flex items-center">
                              <item.icon className="mr-3 h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                              {item.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm sm:text-base text-muted-foreground">{item.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="emission" className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl sm:text-2xl">Emission Schedule</CardTitle>
                      <CardDescription>Projected token release over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="w-full h-64 sm:h-80">
                        <ChartContainer
                          config={{
                            circulatingSupply: {
                              label: 'Circulating Supply',
                              color: 'hsl(var(--chart-1))',
                            },
                            maxSupply: {
                              label: 'Max Supply',
                              color: 'hsl(var(--chart-2))',
                            },
                          }}
                        >
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
                                    text: 'Token Supply',
                                    font: {
                                      size: 12,
                                      weight: 'bold'
                                    }
                                  },
                                  ticks: {
                                    font: {
                                      size: 10
                                    },
                                    callback: function(value) {
                                      return value.toLocaleString() + ' M';
                                    }
                                  }
                                },
                                x: {
                                  title: {
                                    display: true,
                                    text: 'Time',
                                    font: {
                                      size: 12,
                                      weight: 'bold'
                                    }
                                  },
                                  ticks: {
                                    font: {
                                      size: 10
                                    }
                                  }
                                }
                              },
                              plugins: {
                                legend: {
                                  position: 'top' as const,
                                  labels: {
                                    font: {
                                      size: 12
                                    }
                                  }
                                },
                                tooltip: {
                                  mode: 'index' as const,
                                  intersect: false,
                                  titleFont: {
                                    size: 14
                                  },
                                  bodyFont: {
                                    size: 12
                                  },
                                  callbacks: {
                                    label: function(context) {
                                      let label = context.dataset.label || '';
                                      if (label) {
                                        label += ': ';
                                      }
                                      if (context.parsed.y !== null) {
                                        label += (context.parsed.y / 1000000).toFixed(2) + ' M';
                                      }
                                      return label;
                                    }
                                  }
                                },
                              },
                            }} 
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </ChartContainer>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl sm:text-2xl">Circulation Details</CardTitle>
                      <CardDescription>MILTON token circulation over time</CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-base  sm:text-lg">Year</TableHead>
                            <TableHead className="text-base sm:text-lg">Circulating Supply</TableHead>
                            <TableHead className="text-base sm:text-lg">% of Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {emissionSchedule.labels.map((year, index) => (
                            <TableRow key={year}>
                              <TableCell className="text-sm sm:text-base">{year}</TableCell>
                              <TableCell className="text-sm sm:text-base font-medium">{(emissionSchedule.datasets[0].data[index] / 1000000).toFixed(2) + ' M'}</TableCell>
                              <TableCell className="text-sm sm:text-base">
                                {((emissionSchedule.datasets[0].data[index] / 18446000000) * 100).toFixed(2)}%
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="dex" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl">Decentralized Exchanges</CardTitle>
                    <CardDescription>Where to trade MILTON tokens</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {dexList.map((dex, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                          <CardHeader>
                            <CardTitle className="text-base sm:text-lg flex items-center justify-between">
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
                                <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
                              </a>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Button
                              asChild
                              variant="outline"
                              className="w-full text-sm sm:text-base"
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

              <TabsContent value="token-sale" className="space-y-8">
                <TokenSales />
              </TabsContent>

              <TabsContent value="buy" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl">Buy MILTON Tokens (MILTON)</CardTitle>
                    <CardDescription>Get your MILTON tokens now and join the meme revolution!</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base sm:text-lg text-muted-foreground mb-6">
                      Ready to dive into the world of MILTON? Follow these steps to acquire your tokens:
                    </p>
                    <ol className="list-decimal list-inside space-y-4 text-sm sm:text-base text-muted-foreground">
                      <li>Set up a Solana wallet (we recommend Phantom or Solflare)</li>
                      <li>Fund your wallet with SOL or USDC</li>
                      <li>Visit one of our partner DEXes (listed in the DEX tab)</li>
                      <li>Swap your SOL or USDC for MILTON tokens</li>
                      <li>Hold, stake, or use your MILTON tokens in our ecosystem!</li>
                    </ol>
                    <div className="mt-8">
                      <Button 
                        size="lg" 
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        asChild
                      >
                        <Link href="/buy">
                          Buy $MILTON
                          <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calculator" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl">MILTON Token Calculator</CardTitle>
                    <CardDescription>Calculate token metrics based on current price and circulating supply</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="current-price">Current Price ($)</Label>
                          <Input
                            id="current-price"
                            type="number"
                            value={currentPrice}
                            onChange={(e) => setCurrentPrice(parseFloat(e.target.value))}
                            step="0.00000001"
                            min="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="circulating-supply">Circulating Supply</Label>
                          <Input
                            id="circulating-supply"
                            type="number"
                            value={circulatingSupply}
                            onChange={(e) => setCirculatingSupply(parseInt(e.target.value))}
                            step="1"
                            min="0"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <h3 className="text-lg font-semibold">Calculated Metrics</h3>
                        <p>Market Cap: ${(currentPrice * circulatingSupply).toLocaleString()}</p>
                        <p>Fully Diluted Market Cap: ${(currentPrice * 18446000000).toLocaleString()}</p>
                        <p>Circulating Supply: {circulatingSupply.toLocaleString()} MILTON</p>
                        <p>% of Max Supply: {((circulatingSupply / 18446000000) * 100).toFixed(2)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </section>
  )
}