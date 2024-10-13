import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Blink {
  recipient: string
  amount: number
  token: string
  status: 'Completed' | 'Pending' | 'Failed'
}

interface RecentBlinksProps {
  blinks: Blink[]
}

export function RecentBlinks({ blinks }: RecentBlinksProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Blinks</CardTitle>
        <CardDescription>Your latest Blink transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {blinks.map((blink, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>{blink.recipient[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{blink.recipient}</p>
                  <p className="text-xs text-muted-foreground">{blink.amount} {blink.token}</p>
                </div>
              </div>
              <Badge variant={blink.status === 'Completed' ? 'default' : blink.status === 'Pending' ? 'secondary' : 'destructive'}>
                {blink.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}