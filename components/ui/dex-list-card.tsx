import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from 'lucide-react'

interface DEX {
  name: string
  url: string
  iconUrl: string
}

interface DEXListCardProps {
  dexes: DEX[]
}

export function DEXListCard({ dexes }: DEXListCardProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Trade MILTON</CardTitle>
        <CardDescription>MILTON is available on the following decentralized exchanges:</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {dexes.map((dex, index) => (
            <li key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 relative">
                  <Image
                    src={dex.iconUrl}
                    alt={`${dex.name} logo`}
                    layout="fill"
                    objectFit="contain"
                    className="rounded-full"
                  />
                </div>
                <span className="font-medium text-lg">{dex.name}</span>
              </div>
              <Button variant="outline" size="sm" className="text-primary hover:bg-primary/10" asChild>
                <a href={dex.url} target="_blank" rel="noopener noreferrer">
                  Trade
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}