'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useWallet } from '@solana/wallet-adapter-react'

const MILTON_TO_SOL_RATE = 0.000001

export default function ConfirmPurchasePage() {
  const router = useRouter()
  const { publicKey } = useWallet()
  const { toast } = useToast()

  const [miltonAmount, setMiltonAmount] = useState('')
  const [solAmount, setSolAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showDialog, setShowDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (miltonAmount) {
      const sol = parseFloat(miltonAmount) * MILTON_TO_SOL_RATE
      setSolAmount(sol.toFixed(4))
    }
  }, [miltonAmount])

  const handleConfirm = async () => {
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to proceed.",
        variant: "destructive",
      })
      return
    }

    if (!miltonAmount || parseFloat(miltonAmount) <= 0) {
      setError("Invalid MILTON token amount.")
      return
    }

    setIsProcessing(true)
    setProgress(0)

    try {
      const interval = setInterval(() => {
        setProgress((oldProgress) => {
          const newProgress = oldProgress + 20
          if (newProgress === 100) {
            clearInterval(interval)
            setIsProcessing(false)
            toast({
              title: "Purchase Successful!",
              description: `Successfully purchased ${miltonAmount} MILTON tokens.`,
            })
            router.push('/')
          }
          return newProgress
        })
      }, 500)

      if (Math.random() < 0.1) {
        throw new Error("Transaction failed. Please try again.")
      }
    } catch (error) {
      setIsProcessing(false)
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold flex items-center text-black">
          Confirm Purchase
        </h1>
        <Button onClick={() => router.push('/')} variant="outline" className="flex items-center text-blue">
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Back to Home
        </Button>
      </div>

      {error && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
        <CardHeader>
          <CardTitle>Confirm Your Purchase</CardTitle>
          <CardDescription>Confirm buying {miltonAmount} MILTON tokens for {solAmount} SOL.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Please confirm that you wish to purchase  <strong>{miltonAmount}</strong> MILTON tokens
            for <strong>{solAmount}</strong> SOL.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => setShowDialog(true)} className="w-full" disabled={isProcessing}>
            Confirm Purchase
          </Button>
        </CardFooter>
      </Card>

      {isProcessing && (
        <div className="mt-4 max-w-md mx-auto">
          <Progress value={progress} className="w-full" />
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase Confirmation</DialogTitle>
            <DialogDescription>
              Are you sure you want to buy {miltonAmount} MILTON tokens for {solAmount} SOL?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleConfirm} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Purchase'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}