import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from 'lucide-react'

interface PartnershipCardProps {
  name: string
  description: string
  logoUrl: string
  partnerUrl: string
}

export function PartnershipCard({ name, description, logoUrl, partnerUrl }: PartnershipCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="w-full h-40 relative mb-4">
          <Image
            src={logoUrl}
            alt={`${name} logo`}
            layout="fill"
            objectFit="contain"
            className="p-4"
          />
        </div>
        <CardTitle className="text-2xl font-bold">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base mb-4">{description}</CardDescription>
        <Button variant="outline" className="w-full" asChild>
          <a href={partnerUrl} target="_blank" rel="noopener noreferrer">
            Visit Partner
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}