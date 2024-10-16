import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coins, Zap, Users, Trophy, Rocket, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Milton Services | Meme-Powered DeFi Solutions',
  description: 'Explore Milton\'s range of meme-infused DeFi services, including staking, NFT marketplace, community governance, and more.',
}

const services = [
  {
    title: "Meme Staking",
    description: "Stake your MILTON tokens and earn rewards while enjoying hilarious memes.",
    icon: Coins,
    badge: "Popular",
  },
  {
    title: "NFT Meme Marketplace",
    description: "Buy, sell, and trade exclusive meme NFTs using MILTON tokens.",
    icon: Zap,
    badge: "New",
  },
  {
    title: "Community Governance",
    description: "Participate in decision-making and vote on meme proposals for the Milton ecosystem.",
    icon: Users,
  },
  {
    title: "Meme Contests",
    description: "Enter meme creation contests and win MILTON token prizes.",
    icon: Trophy,
  },
  {
    title: "Meme-Fi Yield Farming",
    description: "Provide liquidity and farm yields with a meme-tastic twist.",
    icon: Rocket,
  },
  {
    title: "Meme Vault",
    description: "Securely store your MILTON tokens and meme NFTs in our cutting-edge vault.",
    icon: Shield,
  },
]

export default function ServicesPage() {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Our Services</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the meme-powered DeFi solutions that Milton offers to revolutionize your crypto experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <service.icon className="h-8 w-8 text-primary" />
                  {service.badge && (
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {service.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="mt-4">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-lg text-muted-foreground mb-4">
            Want to explore other sections of our platform?
          </p>
          <div className="flex justify-center space-x-4 mb-8">
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-secondary text-secondary-foreground hover:bg-secondary/90 h-10 py-2 px-4"
            >
              Back to Main
            </a>
            <a
              href="/swap"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
            >
              Get Started with Milton Dashboard
            </a>
          </div>

          <p className="text-lg text-muted-foreground mb-4">
            Ready to dive into the world of meme-powered DeFi?
          </p>
        </div>
      </div>
    </section>
  )
}
