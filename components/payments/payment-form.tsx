'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { TokenSelector } from './token-selector'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, Info } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createTransaction } from '@/lib/solana/transactions'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletButton } from "@/components/ui/wallet-button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"

const formSchema = z.object({
  recipient: z.string().min(32, 'Invalid Solana address').max(44, 'Invalid Solana address'),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Amount must be a positive number',
  }),
})

interface PaymentFormProps {
  onTransactionCreated: (signature: string) => void
}

export function PaymentForm({ onTransactionCreated }: PaymentFormProps) {
  const [selectedToken, setSelectedToken] = useState('MILTON')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const { connected, publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(formSchema),
  })

  const amount = watch('amount')

  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && publicKey) {
        try {
          const balance = await connection.getBalance(publicKey)
          setBalance(balance / 1e9) // Convert lamports to SOL
        } catch (err) {
          console.error('Error fetching balance:', err)
        }
      }
    }

    fetchBalance()
  }, [connected, publicKey, connection])

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!connected || !publicKey || !signTransaction) {
      setError('Please connect your wallet to make a payment')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const transaction = await createTransaction({
        recipient: data.recipient,
        amount: parseFloat(data.amount),
        token: selectedToken,
        senderPublicKey: publicKey,
      })
      
      const signedTransaction = await signTransaction(transaction)
      const signature = await connection.sendRawTransaction(signedTransaction.serialize())
      
      await connection.confirmTransaction(signature, 'confirmed')
      
      onTransactionCreated(signature)
      toast({
        title: "Payment Successful",
        description: `Sent ${data.amount} ${selectedToken} to ${data.recipient}`,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Make a Payment</CardTitle>
        <CardDescription>Send tokens using the Solana blockchain</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              {...register('recipient')}
              placeholder="Solana address"
            />
            {errors.recipient && (
              <p className="text-red-500 text-sm">{errors.recipient.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="flex space-x-2">
              <div className="relative flex-grow">
                <Input
                  id="amount"
                  {...register('amount')}
                  placeholder="0.00"
                  className="pr-16"
                />
                {balance !== null && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => setValue('amount', balance.toString())}
                        >
                          Max
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Use max balance: {balance} {selectedToken}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <TokenSelector onSelect={setSelectedToken} />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-sm">{errors.amount.message}</p>
            )}
          </div>
          {!connected ? (
            <WalletButton />
          ) : (
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Send Payment'
              )}
            </Button>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
          <Info className="h-4 w-4" />
          <p>Payments are processed on the Solana blockchain and may take a few moments to complete.</p>
        </div>
        {balance !== null && (
          <Alert variant="info" className="mb-2">
            <AlertTitle>Your Balance</AlertTitle>
            <AlertDescription>{balance} {selectedToken}</AlertDescription>
          </Alert>
        )}
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