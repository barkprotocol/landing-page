import React from 'react'
import { Progress } from "@/components/ui/progress"

export function StakingOverview() {
  const totalStaked = 2345
  const totalBalance = 28500
  const stakingPercentage = (totalStaked / totalBalance) * 100

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        
        <span>Total Staked</span>
        <span className="font-bold">{totalStaked} MLT</span>
      </div>
      <Progress value={stakingPercentage} className="w-full" />
      <div className="text-sm text-muted-foreground">
        {stakingPercentage.toFixed(2)}% of your balance is staked
      </div>
      <div className="mt-4">
        <h4 className="font-semibold mb-2">Staking Rewards</h4>
        <div className="flex justify-between items-center">
          <span>APY</span>
          <span className="font-bold">12.5%</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span>Rewards Earned</span>
          <span className="font-bold">45.67 MLT</span>
        </div>
      </div>
    </div>
  )
}