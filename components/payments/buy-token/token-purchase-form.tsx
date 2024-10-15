'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ArrowRight, Loader2, DollarSign } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Image from 'next/image'

interface PaymentMethod {
  id: string
  name: string
  icon: string
}

const paymentMethods: PaymentMethod[] = [
  { id: 'SOL', name: 'Solana', icon: 'https://ucarecdn.com/8bcc4664-01b2-4a88-85bc-9ebce234f08b/sol.png' },
  { id: 'USDC', name: 'USD Coin', icon: 'https://ucarecdn.com/67e17a97-f3bd-46c0-8627-e13b8b939d26/usdc.png' },
]

const MILTON_ICON_URL = 'https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg'

interface TokenPurchaseFormProps {
  setError: (error: string | null) => void
}

export default function TokenPurchaseForm({ setError }: TokenPurchaseFormProps) {
  const { publicKey, signTransaction } = useWallet()
  const { toast } = useToast()
  const [miltonAmount, setMiltonAmount] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(paymentMethods[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({})
  const [isLoadingRates, setIsLoadingRates] = useState(false)

  useEffect(() => {
    fetchExchangeRates()
  }, [])

  useEffect(() => {
    if (miltonAmount && exchangeRates[selectedPaymentMethod.id]) {
      const amount = parseFloat(miltonAmount) * exchangeRates[selectedPaymentMethod.id]
      setPaymentAmount(amount.toFixed(selectedPaymentMethod.id === 'SOL' ? 4 : 2))
    } else {
      setPaymentAmount('')
    }
  }, [miltonAmount, selectedPaymentMethod, exchangeRates])

  const fetchExchangeRates = async () => {
    setIsLoadingRates(true)
    try {
      // In a real application, replace this with an actual API call
      const mockRates = { SOL: 0.000001, USDC: 0.001 }
      setExchangeRates(mockRates)
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error)
      toast({
        title: "Failed to fetch exchange rates",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingRates(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicKey) {
      setError("Please connect your wallet to buy MILTON tokens.")
      return
    }
    if (!miltonAmount || parseFloat(miltonAmount) <= 0) {
      setError("Please enter a valid amount of MILTON tokens to buy.")
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
      if (!publicKey || !signTransaction) {
        throw new Error("Wallet not connected")
      }

      // In a real application, replace this with an actual API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      setProgress(100)
      toast({
        title: "Purchase Successful!",
        description: `You have successfully purchased ${miltonAmount} MILTON tokens.`,
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      toast({
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="milton-amount" className="flex items-center space-x-2 text-sm font-medium">
          <Image src={MILTON_ICON_URL} alt="Milton Icon" width={20} height={20} />
          <span>MILTON Amount</span>
        </Label>
        <Input
          id="milton-amount"
          type="number"
          placeholder="Enter MILTON amount"
          value={miltonAmount}
          onChange={(e) => setMiltonAmount(e.target.value)}
          disabled={isSubmitting}
          className="w-full px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Payment Method</Label>
        <RadioGroup
          value={selectedPaymentMethod.id}
          onValueChange={(value) => setSelectedPaymentMethod(paymentMethods.find(method => method.id === value) || paymentMethods[0])}
          className="grid grid-cols-2 gap-4"
        >
          {paymentMethods.map((method) => (
            <div key={method.id}>
              <RadioGroupItem
                value={method.id}
                id={method.id}
                className="peer sr-only"
              />
              <Label
                htmlFor={method.id}
                className="flex flex-col items-center justify-center h-24 rounded-md border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all duration-200 ease-in-out"
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <Image
                    src={method.icon}
                    alt={method.name}
                    width={32}
                    height={32}
                    className="mb-2"
                  />
                  <span className="text-xs font-medium">{method.name}</span>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className="space-y-2">
        <Label htmlFor="payment-amount" className="flex items-center space-x-2 text-sm font-medium">
          <DollarSign className="h-4 w-4" />
          <span>{selectedPaymentMethod.name} Equivalent</span>
        </Label>
        <Input
          id="payment-amount"
          type="text"
          value={paymentAmount}
          readOnly
          disabled
          className="w-full px-3 py-2 text-sm bg-muted"
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

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              You are about to purchase {miltonAmount} MILTON tokens for {paymentAmount} {selectedPaymentMethod.name}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={confirmPurchase} disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Confirm Purchase'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isSubmitting && (
        <Progress value={progress} className="w-full" />
      )}
    </form>
  )
}