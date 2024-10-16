'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Gift, ArrowRight } from 'lucide-react'

interface RewardsPanelProps {
  points: number
}

export default function Component({ points }: RewardsPanelProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const nextTier = Math.ceil(points / 1000) * 1000
  const progress = (points / nextTier) * 100

  const handleRedeemPoints = async () => {
    setIsLoading(true)
    try {
      // In a real application, you would call an API to redeem points
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulating API call
      toast({
        title: "Points Redeemed",
        description: `You have successfully redeemed ${points.toLocaleString()} points.`,
      })
    } catch (error) {
      console.error('Error redeeming points:', error)
      toast({
        title: "Redemption Failed",
        description: "An error occurred while redeeming your points. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewRewards = () => {
    // Implement the logic to view rewards
    console.log('View rewards clicked')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Gift className="mr-2 h-4 w-4" aria-hidden="true" />
          Rewards
        </CardTitle>
        <CardDescription>Earn and redeem points for exclusive benefits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">{points.toLocaleString()} points</span>
            <span className="text-sm text-muted-foreground">{nextTier.toLocaleString()} next tier</span>
          </div>
          <Progress 
            value={progress} 
            className="w-full" 
            aria-label={`Progress to next tier: ${progress.toFixed(1)}%`}
          />
          <p className="text-sm text-muted-foreground">
            You're {(nextTier - points).toLocaleString()} points away from the next tier!
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleRedeemPoints} 
          disabled={isLoading || points === 0}
          aria-busy={isLoading}
        >
          {isLoading ? 'Redeeming...' : 'Redeem Points'}
        </Button>
        <Button 
          variant="ghost" 
          className="text-primary"
          onClick={handleViewRewards}
        >
          View Rewards <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </CardFooter>
    </Card>
  )
}