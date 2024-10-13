'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Coins, Users, Zap, Trophy, ChevronRight, ExternalLink, Heart, Gift, Calculator, Info, PieChart as PieChartIcon, BarChart, Lightbulb, TrendingUp, LayoutGrid, Banknote, ShoppingCart } from 'lucide-react'
import { Overview } from '@/components/ui/milton/overview'
import { TokenDetailsCard } from '@/components/ui/milton/token-details-card'
import { Allocation } from '@/components/ui/milton/allocation'
import { TokenMetric } from '@/components/ui/milton/token-metric-card'
import { Utility } from '@/components/ui/milton/utility'
import { Governance } from '@/components/ui/milton/governance'
import { TokenCalculator } from '@/components/ui/milton/calculator'
import { MarketOverview } from '@/components/ui/milton/market-overview'
import { Rewards } from '@/components/ui/milton/rewards'
import { PriceRate } from '@/components/ui/milton/price-rate'
import { Notice } from '@/components/ui/milton/notice'

// ... (keep all the existing constants like tokenAllocation, tokenMetrics, etc.)

export default function Tokenomics() {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'details', label: 'Details', icon: LayoutGrid },
    { id: 'allocation', label: 'Allocation', icon: PieChartIcon },
    { id: 'metrics', label: 'Metrics', icon: BarChart },
    { id: 'utility', label: 'Utility', icon: Lightbulb },
    { id: 'governance', label: 'Governance', icon: Users },
    { id: 'market', label: 'Market', icon: TrendingUp },
    { id: 'price', label: 'Price', icon: Banknote },
    { id: 'rewards', label: 'Rewards', icon: Gift },
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
            MILTON: The Meme Token with a Mission
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            Explore the comprehensive tokenomics and key information about MILTON, the meme-powered token on Solana
          </p>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
            MILTON is not just another meme token. It's designed to bridge the gap between digital assets and real-world impact. A portion of all transaction fees is allocated to charitable causes and community initiatives, making every MILTON transaction a step towards positive change.
          </p>
        </motion.div>

        <Notice 
          title="Important Information" 
          description="The tokenomics and utility of MILTON are designed to evolve with our community and real-world needs. Always refer to the official documentation for the most up-to-date information."
        />

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
              <TabsContent value="overview" className="space-y-8">
                <Overview />
              </TabsContent>

              <TabsContent value="details" className="space-y-8">
                <TokenDetailsCard tokenDetails={tokenDetails} />
              </TabsContent>

              <TabsContent value="allocation" className="space-y-8">
                <Allocation data={tokenAllocation} />
              </TabsContent>

              <TabsContent value="metrics" className="space-y-8">
                <TokenMetric metrics={tokenMetrics} />
              </TabsContent>

              <TabsContent value="utility" className="space-y-8">
                <Utility utilityItems={tokenUtility} />
              </TabsContent>

              <TabsContent value="governance" className="space-y-8">
                <Governance />
              </TabsContent>

              <TabsContent value="market" className="space-y-8">
                <MarketOverview />
              </TabsContent>

              <TabsContent value="price" className="space-y-8">
                <PriceRate />
              </TabsContent>

              <TabsContent value="rewards" className="space-y-8">
                <Rewards />
              </TabsContent>

              <TabsContent value="calculator" className="space-y-8">
                <TokenCalculator />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </section>
  )
}