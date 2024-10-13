'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Overview } from '@/components/ui/overview'
import { RecentActivity } from '@/components/ui/recent-activity'
import { MemeGenerator } from '@/components/ui/generator'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string>('overview')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-1 space-y-4 p-8 pt-6"
    >
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="memes">Meme Generator</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Overview />
        </TabsContent>
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your team's latest actions and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="memes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meme Generator</CardTitle>
              <CardDescription>
                Create and share memes to earn MILTON tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MemeGenerator />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}