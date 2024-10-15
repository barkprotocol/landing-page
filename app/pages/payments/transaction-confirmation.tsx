'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { checkTransactionStatus } from '@/lib/solana/solana-transactions'

interface TransactionConfirmationProps {
  signature: string
}

export function TransactionConfirmation({ signature }: TransactionConfirmationProps) {
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'failed'>('pending')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const result = await checkTransactionStatus(signature)
        setStatus(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
        setStatus('failed')
      }
    }

    const interval = setInterval(checkStatus, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [signature])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Status</CardTitle>
        <CardDescription>Signature: {signature}</CardDescription>
      </CardHeader>
      <CardContent>
        {status === 'pending' && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Processing</AlertTitle>
            <AlertDescription>Your transaction is being processed...</AlertDescription>
          </Alert>
        )}
        {status === 'confirmed' && (
          <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Confirmed</AlertTitle>
            <AlertDescription>Your transaction has been confirmed!</AlertDescription>
          </Alert>
        )}
        {status === 'failed' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Failed</AlertTitle>
            <AlertDescription>{error || 'Your transaction has failed.'}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => window.open(`https://explorer.solana.com/tx/${signature}`, '_blank')}
          className="w-full"
        >
          View on Solana Explorer
        </Button>
      </CardFooter>
    </Card>
  )
}