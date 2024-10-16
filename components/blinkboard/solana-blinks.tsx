import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from 'date-fns'

interface Blink {
  id: string
  author: string
  content: string
  timestamp: string
  avatar?: string
}

interface SolanaBlinksProps {
  blinks: Blink[]
  isDarkMode: boolean
  isLoading?: boolean
}

export function SolanaBlinks({ blinks, isDarkMode, isLoading = false }: SolanaBlinksProps) {
  if (isLoading) {
    return <BlinksSkeleton />
  }

  return (
    <ScrollArea className="h-[300px] w-full rounded-md border">
      {blinks.length === 0 ? (
        <p className="text-center py-4 text-muted-foreground">No blinks available.</p>
      ) : (
        blinks.map((blink) => (
          <BlinkCard key={blink.id} blink={blink} isDarkMode={isDarkMode} />
        ))
      )}
    </ScrollArea>
  )
}

function BlinkCard({ blink, isDarkMode }: { blink: Blink; isDarkMode: boolean }) {
  return (
    <Card className={`mb-2 mx-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <Avatar>
            <AvatarImage src={blink.avatar} alt={blink.author} />
            <AvatarFallback>{blink.author.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">{blink.author}</p>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(blink.timestamp), { addSuffix: true })}
            </p>
            <p className="text-sm">{blink.content}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BlinksSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="mb-2 mx-2">
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}