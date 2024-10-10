'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, ArrowLeft, Zap, ArrowRight, Loader2 } from 'lucide-react'
import { WalletButton } from "@/components/ui/wallet-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

// Mock exchange rate (replace with actual API call in production)
const MILTON_TO_SOL_RATE = 0.00001

export default function BuyMiltonPage() {
  const router = useRouter()
  const { publicKey } = useWallet()
  const { toast } = useToast()
  const [miltonAmount, setMiltonAmount] = useState('')
  const [solAmount, setSolAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (miltonAmount) {
      const sol = parseFloat(miltonAmount) * MILTON_TO_SOL_RATE
      setSolAmount(sol.toFixed(4))
    } else {
      setSolAmount('')
    }
  }, [miltonAmount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to buy Milton tokens.",
        variant: "destructive",
      })
      return
    }

    if (!miltonAmount || parseFloat(miltonAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount of Milton tokens to buy.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setProgress(0)

    // Simulate transaction process
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        const newProgress = oldProgress + 10
        if (newProgress === 100) {
          clearInterval(interval)
          setIsSubmitting(false)
          toast({
            title: "Purchase Successful!",
            description: `You have successfully purchased ${miltonAmount} MILTON tokens.`,
          })
          // In a real application, you would handle the actual transaction here
        }
        return newProgress
      })
    }, 500)
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold flex items-center">
            <Zap className="mr-2 h-8 w-8 text-primary" />
            Buy Milton Tokens
          </h1>
          <div className="flex items-center space-x-4">
            <Button onClick={() => router.push('/')} variant="outline" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Back to Home
            </Button>
            <WalletButton />
          </div>
        </div>

        {!publicKey && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Wallet not connected</AlertTitle>
            <AlertDescription>
              Please connect your wallet to buy Milton tokens.
            </AlertDescription>
          </Alert>
        )}

        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Purchase Milton Tokens</CardTitle>
            <CardDescription>Enter the amount of MILTON you want to buy.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="milton-amount">MILTON Amount</Label>
                <Input
                  id="milton-amount"
                  type="number"
                  placeholder="Enter MILTON amount"
                  value={miltonAmount}
                  onChange={(e) => setMiltonAmount(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sol-amount">SOL Equivalent</Label>
                <Input
                  id="sol-amount"
                  type="text"
                  value={solAmount}
                  readOnly
                  disabled
                />
              </div>
              <Button type="submit" className="w-full" disabled={!publicKey || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Buy $MILTON
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Exchange Rate: 1 MILTON = {MILTON_TO_SOL_RATE} SOL
            </p>
          </CardFooter>
        </Card>
        {isSubmitting && (
          <div className="mt-4 max-w-md mx-auto">
            <Progress value={progress} className="w-full" />
          </div>
        )}
      </motion.div>
    </div>
  )
}