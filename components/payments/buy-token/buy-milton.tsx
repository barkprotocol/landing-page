'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ArrowRight, Loader2, DollarSign, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Image from 'next/image'

interface PaymentMethod {
  id: string
  name: string
  icon: string
}

const paymentMethods: PaymentMethod[] = [
  { id: 'SOL', name: 'Solana', icon: 'https://ucarecdn.com/67e17a97-f3bd-46c0-8627-e13b8b939d26/usdc.png' },
  { id: 'USDC', name: 'USD Coin', icon: 'https://ucarecdn.com/8bcc4664-01b2-4a88-85bc-9ebce234f08b/sol.png' },
]

const MILTON_ICON_URL = 'https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg'

interface TokenPurchaseFormProps {
  setError: (error: string | null) => void
}

export default function TokenPurchaseForm({ setError }: TokenPurchaseFormProps) {
  const { publicKey, signTransaction } = useWallet()
  const { toast } = useToast()
  const [miltonAmount, setMiltonAmount] = useState<string>('')
  const [paymentAmount, setPaymentAmount] = useState<string>('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(paymentMethods[0])
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false)
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({})
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(false)

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
      const response = await fetch('https://api.example.com/milton/exchange-rates')
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates')
      }
      const data = await response.json()
      setExchangeRates(data.rates)
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error)
      toast({
        title: "Error fetching rates",
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
    setTransactionStatus('processing')

    try {
      if (!publicKey || !signTransaction) {
        throw new Error("Wallet not connected")
      }

      // Call the payment route API
      const response = await fetch('/api/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicKey: publicKey.toBase58(),
          paymentMethod: selectedPaymentMethod.id,
          amount: parseFloat(paymentAmount),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process payment')
      }

      const { transaction: transactionBuffer } = await response.json()

      // Deserialize the transaction
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'devnet' 
          ? 'https://api.devnet.solana.com' 
          : 'https://api.mainnet-beta.solana.com'
      )
      const transaction = Transaction.from(Buffer.from(transactionBuffer, 'base64'))

      setProgress(25)

      // Sign the transaction
      const signedTransaction = await signTransaction(transaction)

      setProgress(50)

      // Send the signed transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize())

      setProgress(75)

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature)

      if (confirmation.value.err) {
        throw new Error("Transaction failed")
      }

      setProgress(100)
      setTransactionStatus('success')
      toast({
        title: "Purchase Successful!",
        description: `You have successfully purchased ${miltonAmount} MILTON tokens. Transaction ID: ${signature}`,
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      setTransactionStatus('error')
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
    <Card className="w-full max-w-md mx-auto bg-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Purchase MILTON Tokens</CardTitle>
        <CardDescription className="text-center">Enter the amount of MILTON you want to buy</CardDescription>
      </CardHeader>
      <CardContent>
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
              onValueChange={(value) => {
                const newMethod = paymentMethods.find(method => method.id === value) || paymentMethods[0]
                setSelectedPaymentMethod(newMethod)
                toast({
                  title: "Payment Method Changed",
                  description: `You have selected ${newMethod.name}.`,
                })
              }}
              className="grid grid-cols-2 gap-4"
            >
              {paymentMethods.map((method) => (
                <div key={method.id}>
                  <RadioGroupItem
                    id={method.id}
                    value={method.id}
                    className="hidden"
                  />
                  <Label
                    htmlFor={method.id}
                    className="flex flex-col items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-400"
                  >
                    <Image src={method.icon} alt={method.name} width={40} height={40} />
                    <span className="mt-2 text-sm font-semibold">{method.name}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center space-x-2 text-sm font-medium">
              <DollarSign size={20} />
              <span>Payment Amount</span>
            </Label>
            <Input
              id="payment-amount"
              type="text"
              value={paymentAmount}
              readOnly
              className="w-full px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
            />
          </div>
          {isLoadingRates && <Loader2 className="animate-spin mx-auto" />}
          {transactionStatus === 'processing' && (
            <Progress value={progress} className="mt-4" />
          )}
          {transactionStatus === 'success' && (
            <Alert variant="success" className="mt-4">
              <CheckCircle2 className="mr-2" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>Your purchase was successful.</AlertDescription>
            </Alert>
          )}
          {transactionStatus === 'error' && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="mr-2" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{setError}</AlertDescription>
            </Alert>
          )}
          <CardFooter>
            <Button
              type="submit"
              disabled={isSubmitting || !miltonAmount || parseFloat(miltonAmount) <= 0}
              className="w-full"
            >
              {isSubmitting ? 'Processing...' : 'Buy MILTON Tokens'}
              <ArrowRight className="ml-2" />
            </Button>
          </CardFooter>
        </form>
      </CardContent>
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              Are you sure you want to buy {miltonAmount} MILTON tokens for {paymentAmount} {selectedPaymentMethod.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button onClick={confirmPurchase}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
