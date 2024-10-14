"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Gift, Sparkles } from 'lucide-react'

const SwapIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 3l4 4-4 4" />
    <path d="M20 7H4" />
    <path d="M8 21l-4-4 4-4" />
    <path d="M4 17h16" />
  </svg>
)

const featuresData = [
  { name: 'Quick Blink', description: 'Send tokens instantly', icon: Zap },
  { name: 'Rewards', description: 'Earn while you hold', icon: Gift },
  { name: 'Staking', description: 'Grow your assets', icon: Sparkles },
  { name: 'Instant Swap', description: 'Exchange tokens easily', icon: SwapIcon },
]

export function MiltonFeatures() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Milton Features</CardTitle>
        <CardDescription>Explore what Milton has to offer</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {featuresData.map((feature) => (
            <Card key={feature.name}>
              <CardContent className="flex flex-col items-center p-6">
                <feature.icon className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">{feature.name}</h3>
                <p className="text-sm text-center text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}