'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, ArrowLeft, Zap, ArrowRight, Loader2, Info } from 'lucide-react'
import { WalletButton } from "@/components/ui/wallet-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Mock exchange rate (replace with actual API call in production)
const MILTON_TO_SOL_RATE = 0.000001
// Add the contract address (replace with actual contract address)
const CONTRACT_ADDRESS = "YourContractAddressHere"
const SOLSCAN_URL = `https://solscan.io/token/${CONTRACT_ADDRESS}`

export default function BuyMiltonPage() {
  const router = useRouter()
  const { publicKey } = useWallet()
  const { toast } = useToast()
  const [miltonAmount, setMiltonAmount] = useState('')
  const [solAmount, setSolAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        description: "Please connect your wallet to buy SPL tokens.",
        variant: "destructive",
      })
      return
    }

    if (!miltonAmount || parseFloat(miltonAmount) <= 0) {
      setError("Please enter a valid amount of SPL tokens to buy.")
      return
    }

    setShowConfirmDialog(true)
  }

  const confirmPurchase = async () => {
    setShowConfirmDialog(false)
    setIsSubmitting(true)
    setProgress(0)
    setError(null)

    try {
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

      // Simulating a potential error
      if (Math.random() < 0.1) { // 10% chance of error
        throw new Error("Transaction failed. Please try again.")
      }
    } catch (error) {
      setIsSubmitting(false)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      toast({
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 bg-navy-800 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold flex items-center text-black">
            <img src="https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg" alt="Milton Icon" className="mr-2 h-14 w-14" />
            Buy $Milton´s
          </h1>
          <div className="flex items-center space-x-4">
            <Button onClick={() => router.push('/')} variant="outline" className="flex items-center text-blue">
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
              Please connect your wallet to buy MILTON tokens.
            </AlertDescription>
          </Alert>
        )}

        <Card className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
          <CardHeader>
            <CardTitle>Purchase Milton Tokens</CardTitle>
            <CardDescription>Enter the amount of MILTON you want to buy.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="milton-amount">MILTON Amount</Label>
                <div className="relative">
                  <Input
                    id="milton-amount"
                    type="number"
                    placeholder="Enter MILTON amount"
                    value={miltonAmount}
                    onChange={(e) => {
                      setMiltonAmount(e.target.value)
                      setError(null)
                    }}
                    disabled={isSubmitting}
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={error ? "milton-amount-error" : undefined}
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Enter the amount of MILTON tokens you wish to purchase.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {error && (
                  <p id="milton-amount-error" className="text-sm text-red-500 mt-1">
                    {error}
                  </p>
                )}
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

        {/* Information Card */}
        <Card className="mt-8 w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
          <CardHeader>
            <CardTitle>About Milton Tokens</CardTitle>
            <CardDescription>Key details and benefits of MILTON tokens.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Milton tokens are designed to facilitate transactions within our ecosystem. 
              They offer unique benefits such as access to exclusive events, discounts on services, and rewards for community engagement.
            </p>
            <p className="mt-2 text-gray-700">
              Always ensure you are purchasing from official channels to avoid scams and fraud. 
              Stay informed about token updates and community announcements through our official channels.
            </p>
            <div className="mt-4">
              <p className="text-gray-700">
                <strong>Contract Address:</strong> {CONTRACT_ADDRESS}
              </p>
              <p className="text-gray-700">
                <a href={SOLSCAN_URL} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  View on Solscan
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {isSubmitting && (
          <div className="mt-4 max-w-md mx-auto">
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Purchase</DialogTitle>
              <DialogDescription>
                Are you sure you want to purchase {miltonAmount} MILTON tokens for {solAmount} SOL?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
              <Button onClick={confirmPurchase}>Confirm Purchase</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  )
}