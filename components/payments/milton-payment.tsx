'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const miltonPaymentSchema = z.object({
  amount: z.string().min(1, 'Amount is required').refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Amount must be a positive number'),
  recipientAddress: z.string().min(32, 'Invalid Solana address').max(44, 'Invalid Solana address'),
  memo: z.string().max(100, 'Memo must be 100 characters or less').optional(),
})

type MiltonPaymentFormData = z.infer<typeof miltonPaymentSchema>

export function MiltonPaymentComponent() {
  const wallet = useWallet()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors }, reset } = useForm<MiltonPaymentFormData>({
    resolver: zodResolver(miltonPaymentSchema),
  })

  const onSubmit = async (data: MiltonPaymentFormData) => {
    if (!wallet.connected || !wallet.publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to make a MILTON payment.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/milton/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(data.amount),
          recipientAddress: data.recipientAddress,
          memo: data.memo,
          senderAddress: wallet.publicKey.toString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Payment failed')
      }

      const result = await response.json()
      
      toast({
        title: "Payment Successful",
        description: `Sent ${data.amount} MILTON to ${data.recipientAddress}`,
      })

      reset() // Reset form after successful submission
    } catch (error) {
      console.error('Error processing payment:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
      toast({
        title: "Payment Failed",
        description: "An error occurred while processing the payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Send MILTON</CardTitle>
        <CardDescription>Make a payment using MILTON tokens</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (MILTON)</Label>
            <Input
              id="amount"
              type="number"
              step="0.000000001"
              min="0"
              {...register('amount')}
              placeholder="0.00"
            />
            {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipientAddress">Recipient Address</Label>
            <Input
              id="recipientAddress"
              {...register('recipientAddress')}
              placeholder="Solana address"
            />
            {errors.recipientAddress && <p className="text-red-500 text-sm">{errors.recipientAddress.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="memo">Memo (Optional)</Label>
            <Input
              id="memo"
              {...register('memo')}
              placeholder="Add a message (max 100 characters)"
              maxLength={100}
            />
            {errors.memo && <p className="text-red-500 text-sm">{errors.memo.message}</p>}
          </div>
          <div className="pt-4 space-y-4">
            {!wallet.connected ? (
              <WalletMultiButton className="w-full" />
            ) : (
              <Button type="submit" className="w-full" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Send MILTON'
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <p className="text-sm text-gray-500 mb-2">
          Payments are processed on the Solana blockchain and may take a few moments to complete.
        </p>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  )
}