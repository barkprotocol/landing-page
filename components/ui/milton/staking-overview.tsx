'use client'

import React from 'react'
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Coins, TrendingUp } from 'lucide-react'

interface StakingOverviewProps {
  totalStaked: number
  totalBalance: number
  apy: number
  rewardsEarned: number
}

export default function Component({ 
  totalStaked = 2345, 
  totalBalance = 28500, 
  apy = 12.5, 
  rewardsEarned = 45.67 
}: StakingOverviewProps) {
  const stakingPercentage = (totalStaked / totalBalance) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Coins className="h-5 w-5" />
          <span>Staking Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total Staked</span>
          <span className="font-bold">{totalStaked.toLocaleString()} MILTON</span>
        </div>
        <Progress 
          value={stakingPercentage} 
          className="w-full" 
          aria-label={`${stakingPercentage.toFixed(2)}% of balance staked`}
        />
        <div className="text-sm text-muted-foreground">
          {stakingPercentage.toFixed(2)}% of your balance is staked
        </div>
        <div className="mt-4">
          <h4 className="font-semibold mb-2 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Staking Rewards
          </h4>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">APY</span>
            <span className="font-bold">{apy}%</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-muted-foreground">Rewards Earned</span>
            <span className="font-bold">{rewardsEarned.toLocaleString()} MLT</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}