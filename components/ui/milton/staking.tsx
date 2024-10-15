import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function Staking() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Staking Overview</CardTitle>
          <CardDescription>Your current staking position</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>Staked Amount: 500 MILTON</p>
            <p>Rewards Earned: 50 MILTON</p>
            <p>Annual Percentage Yield (APY): 10%</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Stake Tokens</CardTitle>
          <CardDescription>Stake your Milton tokens to earn rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stakeAmount">Amount to Stake</Label>
              <Input id="stakeAmount" type="number" placeholder="Enter amount to stake" />
            </div>
            <Button type="submit">Stake Tokens</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}