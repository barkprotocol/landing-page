'use client'

import React, { useState, useEffect } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { Connection, PublicKey } from '@solana/web3.js'
import { MILTON_DECIMALS, USDC_DECIMALS, getExplorerUrl } from '@/lib/solana/config'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { formatUnits } from 'ethers'

interface TransactionConfirmationProps {
  signature: string
  expectedAmount: number
  tokenType: 'MILTON' | 'USDC'
  onClose: () => void
}

export default function TransactionConfirmation({ 
  signature, 
  expectedAmount, 
  tokenType, 
  onClose 
}: TransactionConfirmationProps) {
  const { connection } = useConnection()
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'failed'>('pending')
  const [transactionDetails, setTransactionDetails] = useState<any>(null)

  useEffect(() => {
    const checkTransaction = async () => {
      try {
        const result = await connection.confirmTransaction(signature)
        if (result.value.err) {
          setStatus('failed')
        } else {
          setStatus('confirmed')
          const txDetails = await connection.getParsedTransaction(signature, 'confirmed')
          setTransactionDetails(txDetails)
        }
      } catch (error) {
        console.error('Error confirming transaction:', error)
        setStatus('failed')
      }
    }

    checkTransaction()
  }, [connection, signature])

  const formatAmount = (amount: number) => {
    const decimals = tokenType === 'MILTON' ? MILTON_DECIMALS : USDC_DECIMALS
    return parseFloat(formatUnits(amount.toString(), decimals)).toFixed(4)
  }

  const renderStatus = () => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Pending
          </Badge>
        )
      case 'confirmed':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <CheckCircle className="mr-2 h-4 w-4" />
            Confirmed
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            <XCircle className="mr-2 h-4 w-4" />
            Failed
          </Badge>
        )
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Transaction Confirmation</CardTitle>
        <CardDescription>Details of your recent transaction</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Status:</span>
          {renderStatus()}
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold">Amount:</span>
          <span>{formatAmount(expectedAmount)} {tokenType}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold">Transaction Signature:</span>
          <Button
            variant="link"
            className="p-0 h-auto font-normal"
            onClick={() => window.open(getExplorerUrl(signature, 'tx'), '_blank')}
          >
            {signature.slice(0, 8)}...{signature.slice(-8)}
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
        {status === 'confirmed' && transactionDetails && (
          <>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Block:</span>
              <span>{transactionDetails.slot}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Fee:</span>
              <span>{formatUnits(transactionDetails.meta.fee.toString(), 9)} SOL</span>
            </div>
          </>
        )}
        {status === 'pending' && (
          <Skeleton className="h-4 w-full" />
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={onClose}
          disabled={status === 'pending'}
        >
          {status === 'confirmed' ? 'Close' : 'Dismiss'}
        </Button>
      </CardFooter>
    </Card>
  )
}