'use client'

import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

type ActivityType = 'send' | 'receive' | 'swap'

interface Activity {
  id: string
  type: ActivityType
  amount: number
  currency: string
  otherParty: string
  timestamp: Date
}

const mockActivities: Activity[] = [
  { id: '1', type: 'send', amount: 0.5, currency: 'SOL', otherParty: 'Alice', timestamp: new Date('2023-06-15T10:30:00') },
  { id: '2', type: 'receive', amount: 100, currency: 'USDC', otherParty: 'Bob', timestamp: new Date('2023-06-14T15:45:00') },
  { id: '3', type: 'swap', amount: 50, currency: 'USDC', otherParty: 'SOL', timestamp: new Date('2023-06-13T09:20:00') },
  { id: '4', type: 'send', amount: 10, currency: 'MILTON', otherParty: 'Charlie', timestamp: new Date('2023-06-12T18:00:00') },
  { id: '5', type: 'receive', amount: 0.1, currency: 'SOL', otherParty: 'David', timestamp: new Date('2023-06-11T11:10:00') },
]

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'send':
      return <ArrowUpRight className="h-4 w-4 text-red-500" aria-hidden="true" />
    case 'receive':
      return <ArrowDownRight className="h-4 w-4 text-green-500" aria-hidden="true" />
    case 'swap':
      return <RefreshCcw className="h-4 w-4 text-blue-500" aria-hidden="true" />
  }
}

const getActivityDescription = (activity: Activity) => {
  switch (activity.type) {
    case 'send':
      return `Sent ${activity.amount} ${activity.currency} to ${activity.otherParty}`
    case 'receive':
      return `Received ${activity.amount} ${activity.currency} from ${activity.otherParty}`
    case 'swap':
      return `Swapped ${activity.amount} ${activity.currency} for ${activity.otherParty}`
  }
}

export function RecentActivity() {
  const [activities, setActivities] = React.useState<Activity[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setActivities(mockActivities)
        setIsLoading(false)
      } catch (err) {
        setError("Failed to load recent activities. Please try again later.")
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [])

  if (isLoading) {
    return <div className="text-center">Loading recent activities...</div>
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  if (activities.length === 0) {
    return <div className="text-center">No recent activities found.</div>
  }

  return (
    <ScrollArea className="h-[400px]">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center mb-4 last:mb-0">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${activity.otherParty}`} alt={activity.otherParty} />
            <AvatarFallback>{activity.otherParty.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{getActivityDescription(activity)}</p>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
            </p>
          </div>
          <div className="ml-auto font-medium">
            {getActivityIcon(activity.type)}
          </div>
        </div>
      ))}
    </ScrollArea>
  )
}