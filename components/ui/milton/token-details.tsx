'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Coins, Users, Zap, BarChart2, Globe } from 'lucide-react'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const tokenDetails = [
  { attribute: 'Token Name', value: 'MILTON' },
  { attribute: 'Token Symbol', value: 'MILTON' },
  { attribute: 'Total Supply', value: '18,640,000,000 MILTON' },
  { attribute: 'Blockchain', value: 'Solana' },
  { attribute: 'Token Standard', value: 'SPL' },
  { attribute: 'Decimals', value: '9' },
  { attribute: 'Initial Price', value: '$0.000001' },
  { attribute: 'Launch Date', value: 'October 15, 2024' },
]

const tokenAllocation = {
  labels: ['Community Rewards', 'Team', 'Development', 'Marketing', 'Liquidity', 'Reserve'],
  datasets: [
    {
      data: [40, 15, 20, 10, 10, 5],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
      ],
      borderWidth: 1,
    },
  ],
}

const features = [
  { icon: Coins, title: 'Meme Economy', description: 'Create and trade meme-based assets' },
  { icon: Users, title: 'Community Driven', description: 'Governed by meme enthusiasts' },
  { icon: Zap, title: 'Fast Transactions', description: 'Lightning-fast Solana-based transfers' },
  { icon: BarChart2, title: 'DeFi Integration', description: 'Stake and earn yields with your memes' },
  { icon: Globe, title: 'Global Impact', description: 'Participate in meme-driven charitable initiatives' },
]

export function TokenDetails() {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-foreground mb-4">Milton Token Details</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the power and potential of the Milton token, the driving force behind the meme revolution on Solana.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Token Information</CardTitle>
              <CardDescription>Key details about the Milton token</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
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

          <Card>
            <CardHeader>
              <CardTitle>Token Allocation</CardTitle>
              <CardDescription>Distribution of Milton tokens</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-64">
                <Pie data={tokenAllocation} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-16">
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
            <CardDescription>What makes Milton unique</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <feature.icon className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Token Utility</CardTitle>
            <CardDescription>How you can use Milton tokens</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Participate in meme creation contests and earn rewards</li>
              <li>Vote on community proposals and shape the future of Milton</li>
              <li>Access exclusive meme NFT collections</li>
              <li>Stake tokens to earn passive income</li>
              <li>Use as currency in the Milton meme marketplace</li>
              <li>Contribute to charitable causes through meme-driven campaigns</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}