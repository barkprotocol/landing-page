import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from 'next/link'
import { FileText, Image } from 'lucide-react'

interface GenerateSectionProps {
  isDarkMode: boolean
}

export function GenerateSection({ isDarkMode }: GenerateSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-2">Generate NFT</h3>
          <p className="text-sm text-gray-500 mb-4">Create unique digital assets on the Solana blockchain.</p>
          <Link href="/workspaces/landing-page/components/blinkboard/blink-generator/generate/nft/page" passHref>
            <Button className="w-full">
              <Image className="w-4 h-4 mr-2" />
              Create NFT
            </Button>
          </Link>
        </CardContent>
      </Card>
      <Card className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-2">Generate Token</h3>
          <p className="text-sm text-gray-500 mb-4">Launch your own token on the Solana network.</p>
          <Link href="/workspaces/landing-page/components/blinkboard/blink-generator/generate/token/page" passHref>
            <Button className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              Create Token
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}