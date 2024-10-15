'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Circle, Clock } from 'lucide-react'

interface RoadmapItem {
  title: string
  description: string
  status: 'completed' | 'in-progress' | 'planned'
  date: string
}

const roadmapItems: RoadmapItem[] = [
  {
    title: 'Token Launch',
    description: 'Initial launch of MILTON token on Solana blockchain',
    status: 'completed',
    date: '2024 Q4'
  },
  {
    title: 'Wallet Integration',
    description: 'Integration with major Solana wallets',
    status: 'completed',
    date: '2024 Q4'
  },
  {
    title: 'Staking Platform',
    description: 'Launch of MILTON token staking platform',
    status: 'in-progress',
    date: '2025 Q3'
  },
  {
    title: 'DEX Listing',
    description: 'Listing on major decentralized exchanges',
    status: 'in-progress',
    date: '2024 Q4'
  },
  {
    title: 'Governance System',
    description: 'Implementation of community governance for MILTON holders',
    status: 'planned',
    date: '2024 Q4'
  },
  {
    title: 'Mobile App',
    description: 'Launch of MILTON mobile app for iOS and Android',
    status: 'planned',
    date: '2025 Q4'
  }
]

const statusColors = {
  completed: 'bg-green-500',
  'in-progress': 'bg-yellow-500',
  planned: 'bg-blue-500'
}

const statusIcons = {
  completed: <CheckCircle2 className="h-4 w-4" />,
  'in-progress': <Clock className="h-4 w-4" />,
  planned: <Circle className="h-4 w-4" />
}

export default function Roadmap() {
  return (
    <div className="w-full max-w-4xl mx-auto py-12">
      <h2 className="text-3xl font-bold text-center mb-8">MILTON Project Roadmap</h2>
      <div className="space-y-8">
        {roadmapItems.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">{item.title}</CardTitle>
                <Badge variant="outline" className={`${statusColors[item.status]} text-white`}>
                  {statusIcons[item.status]}
                  <span className="ml-1 capitalize">{item.status.replace('-', ' ')}</span>
                </Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg mb-2">{item.description}</CardDescription>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  Expected: {item.date}
                </div>
              </CardContent>
            </Card>
            {index < roadmapItems.length - 1 && (
              <div className="flex justify-center my-4">
                <Separator className="h-8 w-px bg-border" orientation="vertical" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}