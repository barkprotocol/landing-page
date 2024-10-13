import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Coins, Users, Zap, Globe, Shield, Rocket } from "lucide-react"
import Link from "next/link"

export default function LearnMore() {
  const ecosystemFeatures = [
    {
      title: "Decentralized Finance",
      description: "Access a wide range of DeFi services powered by MILTON tokens.",
      icon: Coins,
    },
    {
      title: "Community Governance",
      description: "Participate in key decisions shaping the future of the Milton ecosystem.",
      icon: Users,
    },
    {
      title: "Meme Creation Platform",
      description: "Create, share, and monetize memes using blockchain technology.",
      icon: Zap,
    },
    {
      title: "Global Impact Initiatives",
      description: "Contribute to charitable causes and disaster relief efforts worldwide.",
      icon: Globe,
    },
  ]

  const miltonSolutions = [
    {
      title: "MemeVault",
      description: "Secure storage and management for your MILTON tokens and meme NFTs.",
      icon: Shield,
    },
    {
      title: "MemeSwap",
      description: "Decentralized exchange for trading MILTON and other meme-based tokens.",
      icon: Zap,
    },
    {
      title: "MemeLaunch",
      description: "Launchpad for new meme-inspired projects and token sales.",
      icon: Rocket,
    },
    {
      title: "MemeGovernance",
      description: "Decentralized voting platform for community-driven decision making.",
      icon: Users,
    },
  ]

  return (
    <section className="py-16 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="outline">Learn More</Badge>
          <h2 className="text-3xl font-bold mb-4">Discover the Milton Ecosystem</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore the innovative solutions and features that make Milton a 
            unique player in the world of meme-powered finance.
          </p>
        </div>

        <Tabs defaultValue="ecosystem" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ecosystem">Ecosystem Features</TabsTrigger>
            <TabsTrigger value="solutions">Solutions</TabsTrigger>
          </TabsList>
          <TabsContent value="ecosystem">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {ecosystemFeatures.map((feature, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <feature.icon className="mr-2 h-6 w-6 text-primary" style={{ color: '#FFECB1' }} />
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="solutions">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {miltonSolutions.map((solution, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <solution.icon className="mr-2 h-6 w-6 text-primary" style={{ color: '#FFECB1' }} />
                      {solution.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{solution.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link href="/ecosystem">
              Explore Full Ecosystem
              <ArrowRight className="ml-2 h-4 w-4" style={{ color: '#FFECB1' }} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}