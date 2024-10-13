import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface Reward {
  name: string
  progress: number
  total: number
  reward: string
}

interface RewardsProgressProps {
  rewards: Reward[]
}

export function RewardsProgress({ rewards }: RewardsProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rewards</CardTitle>
        <CardDescription>Track your progress and earn rewards</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rewards.map((reward) => (
            <div key={reward.name}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{reward.name}</span>
                <span className="text-sm text-muted-foreground">{reward.progress}/{reward.total}</span>
              </div>
              <Progress value={(reward.progress / reward.total) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">Reward: {reward.reward}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}