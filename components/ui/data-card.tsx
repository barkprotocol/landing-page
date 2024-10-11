import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react'

interface DataCardProps {
  title: string
  value: string | number
  description?: string
  change?: number
  changeType?: 'increase' | 'decrease'
  action?: {
    label: string
    onClick: () => void
  }
}

export default function DataCard({ 
  title, 
  value, 
  description, 
  change, 
  changeType, 
  action 
}: DataCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {(change !== undefined && changeType) && (
          <div className="flex items-center mt-2">
            <Badge variant={changeType === 'increase' ? 'default' : 'destructive'} className="mr-2">
              {changeType === 'increase' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {Math.abs(change)}%
            </Badge>
            <span className="text-sm text-muted-foreground">
              {changeType === 'increase' ? 'Increase' : 'Decrease'}
            </span>
          </div>
        )}
      </CardContent>
      {action && (
        <CardFooter>
          <Button variant="outline" onClick={action.onClick} className="w-full">
            {action.label}
            <ArrowUpRight className="w-4 h-4 ml-2" />
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}