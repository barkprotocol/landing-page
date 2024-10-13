import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowUpRight, ArrowDownRight, Percent } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export function Staking() {
  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const { toast } = useToast()

  const handleStake = () => {
    toast({
      title: "Staking Successful",
      description: `You have staked ${stakeAmount} MILTON tokens.`,
    })
    setStakeAmount('')
  }

  const handleUnstake = () => {
    toast({
      title: "Unstaking Successful",
      description: `You have unstaked ${unstakeAmount} MILTON tokens.`,
    })
    setUnstakeAmount('')
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Staking</CardTitle>
        <CardDescription>Stake your MILTON tokens to earn rewards</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stake" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stake">Stake</TabsTrigger>
            <TabsTrigger value="unstake">Unstake</TabsTrigger>
          </TabsList>
          <TabsContent value="stake">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="stakeAmount">Amount to Stake</Label>
                <div className="flex items-center space-x-2">
                  <Percent className="h-4 w-4" />
                  <span className="text-sm font-medium">APY: 5.2%</span>
                </div>
              </div>
              <Input
                id="stakeAmount"
                placeholder="Enter amount"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
              />
              <Button className="w-full" onClick={handleStake}>
                <ArrowUpRight className="mr-2 h-4 w-4" /> Stake MILTON
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="unstake">
            <div className="space-y-4">
              <Label htmlFor="unstakeAmount">Amount to Unstake</Label>
              <Input
                id="unstakeAmount"
                placeholder="Enter amount"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
              />
              <Button className="w-full" onClick={handleUnstake}>
                <ArrowDownRight className="mr-2 h-4 w-4" /> Unstake MILTON
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}