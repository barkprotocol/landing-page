import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface UtilityItem {
  title: string
  description: string
  icon: LucideIcon
}

interface UtilityProps {
  utilityItems: UtilityItem[]
}

export function Utility({ utilityItems }: UtilityProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">Utility</CardTitle>
        <CardDescription>Ways to use your MILTON tokens</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-3">MILTON's Commitment to Global Good</h3>
          <p className="text-base sm:text-lg text-muted-foreground">
            A portion of all transaction fees is allocated to charitable causes and global initiatives, making every MILTON transaction a step towards positive change.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {utilityItems.map((item, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg flex items-center">
                  <item.icon className="mr-3 h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}