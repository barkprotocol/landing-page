'use client'

import { useState } from 'react'
import { PaymentForm } from '@/components/payments/payment-form'
import { TransactionConfirmation } from '@/components/payments/transaction-confirmation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentsPage() {
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Milton Protocol Payments</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Make a Payment</CardTitle>
            <CardDescription>Send tokens using the Solana blockchain</CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentForm onTransactionCreated={setTransactionSignature} />
          </CardContent>
        </Card>
        {transactionSignature && (
          <Card>
            <CardHeader>
              <CardTitle>Transaction Status</CardTitle>
              <CardDescription>Check the status of your transaction</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionConfirmation signature={transactionSignature} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}