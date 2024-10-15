'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { WalletProvider } from '@/components/wallet-provider'
import TokenPurchaseForm from '@/components/payments/buy-token/token-purchase-form'
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, AlertCircle, Info, Coins, Shield } from 'lucide-react'

const MILTON_LOGO_URL = 'https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg'

export default function BuyPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleError = (errorMessage: string | null) => {
    setError(errorMessage)
    if (errorMessage) {
      console.error(errorMessage)
      // Additional error handling logic can be added here
    }
  }

  return (
    <WalletProvider>
      <main className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Header router={router} />
          <ErrorDisplay error={error} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PurchaseFormContainer setError={handleError} />
            <InformationSection />
          </div>
          <SupportSection />
        </div>
      </main>
    </WalletProvider>
  )
}

function Header({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <div className="flex justify-between items-center mb-8">
      <Button
        onClick={() => router.push('/')}
        variant="outline"
        className="flex items-center text-primary hover:bg-primary/10 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Main
      </Button>
      <h1 className="text-3xl font-bold text-center flex items-center">
        <Image
          src={MILTON_LOGO_URL}
          alt="Milton Logo"
          width={40}
          height={40}
          className="mr-2"
        />
        Buy $MILTON
      </h1>
    </div>
  )
}

function ErrorDisplay({ error }: { error: string | null }) {
  if (!error) return null

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )
}

function PurchaseFormContainer({ setError }: { setError: (error: string | null) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase MILTON Tokens</CardTitle>
        <CardDescription>Enter the amount of MILTON you want to buy</CardDescription>
      </CardHeader>
      <CardContent>
        <TokenPurchaseForm setError={setError} />
      </CardContent>
    </Card>
  )
}

function InformationSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="mr-2 h-5 w-5" />
            About MILTON Tokens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            MILTON tokens are the native cryptocurrency of the Milton ecosystem. They can be used for various purposes within our platform, including accessing premium features, participating in governance, and more.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Coins className="mr-2 h-5 w-5" />
            Token Utility
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-sm text-muted-foreground">
            <li>Access to exclusive content and features</li>
            <li>Participation in community governance</li>
            <li>Rewards for platform engagement</li>
            <li>Trading on supported exchanges</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your MILTON tokens are secured on the Solana blockchain. Always ensure you're interacting with official Milton platforms and keep your wallet information safe.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function SupportSection() {
  return (
    <div className="mt-8 text-center text-sm text-muted-foreground">
      <p>Need help? Contact our support team at</p>
      <a href="mailto:support@milton.com" className="text-primary hover:underline">
        support@miltonprotocol.com
      </a>
    </div>
  )
}