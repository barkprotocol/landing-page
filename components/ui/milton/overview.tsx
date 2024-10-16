import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Coins, Users, Zap, Trophy, Heart, Gift, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface FeatureProps {
  icon: React.ReactNode
  title: string
  description: string
}

const Feature: React.FC<FeatureProps> = ({ icon, title, description }) => (
  <div className="flex items-start space-x-3">
    <div className="mt-1" aria-hidden="true">{icon}</div>
    <div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
)

const features = [
  {
    icon: <Coins className="h-5 w-5 text-primary" />,
    title: "Fast Transactions",
    description: "Lightning-fast and low-cost transactions on the Solana network"
  },
  {
    icon: <Users className="h-5 w-5 text-primary" />,
    title: "Community Governance",
    description: "Participate in key decisions shaping the MILTON ecosystem"
  },
  {
    icon: <Zap className="h-5 w-5 text-primary" />,
    title: "Staking Rewards",
    description: "Earn rewards by staking your MILTON tokens"
  },
  {
    icon: <Trophy className="h-5 w-5 text-primary" />,
    title: "Meme Contests",
    description: "Regular meme contests with MILTON token prizes"
  },
  {
    icon: <Heart className="h-5 w-5 text-primary" />,
    title: "Charitable Initiatives",
    description: "A portion of fees goes to global good and disaster relief"
  },
  {
    icon: <Gift className="h-5 w-5 text-primary" />,
    title: "Token Burns",
    description: "Quarterly token burns to reduce supply over time"
  },
]

export function Overview() {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <CardTitle className="text-2xl sm:text-3xl font-bold">MILTON Token Overview</CardTitle>
            <CardDescription className="mt-2">The meme-powered token on Solana</CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs sm:text-sm mt-2 sm:mt-0">
            SPL Token
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-6">
          <div className="w-full md:w-2/3 space-y-6">
            <p className="text-base sm:text-lg text-muted-foreground">
              MILTON is a community-driven meme token built on the Solana blockchain, combining the power of memes with decentralized finance and social impact. With a total supply of 18.446 billion tokens, MILTON aims to create a vibrant ecosystem where creativity, humor, financial innovation, and charitable efforts intersect.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <Feature key={index} {...feature} />
              ))}
            </div>
            <div className="flex flex-wrap gap-4 mt-6">
              <Button asChild>
                <Link href="/buy">
                  Buy MILTON
                  <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/tokenomics">
                  View Tokenomics
                  <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </Link>
              </Button>
            </div>
          </div>
          <div className="w-full md:w-1/3 flex justify-center">
            <Image
              src="https://ucarecdn.com/137628fb-f546-490c-887a-1d0d3177f542/MiltonCard.png"
              alt="MILTON Token Logo"
              width={200}
              height={200}
              className="rounded-full shadow-lg"
              priority
            />
          </div>
        </div>
        <div className="mt-8 p-4 bg-secondary/50 rounded-lg">
          <h3 className="font-semibold mb-2">Quick Facts</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Blockchain: Solana</li>
            <li>Standard(s): SPL & Token-2022</li>
            <li>Max Supply: 18,446,000,000 MILTON</li>
            <li>Initial Circulating Supply: 7,378,400,000 MILTON</li>
            <li>Initial Price: $0.00001</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}