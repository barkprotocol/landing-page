import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const allocationData = [
  { category: 'Community Rewards', percentage: 40, description: 'Incentives for community participation and growth' },
  { category: 'Development', percentage: 20, description: 'Funding for ongoing platform development and improvements' },
  { category: 'Team', percentage: 15, description: 'Allocation for team members and advisors' },
  { category: 'Marketing', percentage: 15, description: 'Resources for marketing and partnerships' },
  { category: 'Liquidity', percentage: 10, description: 'Ensuring market liquidity and stability' },
]

export function Allocation() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Token Allocation</CardTitle>
        <CardDescription>Breakdown of MILTON token allocation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {allocationData.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{item.category}</h3>
                <span className="text-sm text-muted-foreground">{item.percentage}%</span>
              </div>
              <Progress value={item.percentage} className="h-2" />
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}