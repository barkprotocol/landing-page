'use client'

import React, { useEffect, useState } from 'react'
import { createQR, encodeURL, TransferRequestURLFields, findReference, validateTransfer, FindReferenceError, ValidateTransferError } from "@solana/pay"
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface QRCodeProps {
  recipient: string
  amount: number
  label: string
  message: string
}

export function QRCode({ recipient, amount, label, message }: QRCodeProps) {
  const [qr, setQr] = useState<string>('')
  const [reference, setReference] = useState<PublicKey>()
  const { toast } = useToast()

  useEffect(() => {
    const generateQR = async () => {
      try {
        // Generate a new reference public key for this transaction
        const reference = PublicKey.unique()
        setReference(reference)

        // Create the Solana Pay URL
        const url = encodeURL({
          recipient: new PublicKey(recipient),
          amount,
          reference,
          label,
          message,
        } as TransferRequestURLFields)

        // Create the QR code
        const qrCode = createQR(url, 512, 'transparent')
        const qrCodeURL = await qrCode.getRawData('png')
        if (qrCodeURL) {
          setQr(qrCodeURL as string)
        }
      } catch (error) {
        console.error('Error generating QR code:', error)
        toast({
          title: "Error",
          description: "Failed to generate QR code. Please try again.",
          variant: "destructive",
        })
      }
    }

    generateQR()
  }, [recipient, amount, label, message, toast])

  useEffect(() => {
    const interval = setInterval(async () => {
      if (reference) {
        try {
          const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
          const signatureInfo = await findReference(connection, reference, { finality: 'confirmed' })
          await validateTransfer(connection, signatureInfo.signature, {
            recipient: new PublicKey(recipient),
            amount,
            reference,
          })
          
          toast({
            title: "Payment Confirmed",
            description: "The Solana transfer has been confirmed!",
          })
          clearInterval(interval)
        } catch (e) {
          if (e instanceof FindReferenceError) {
            // No transaction found yet, ignore this error
            return;
          }
          if (e instanceof ValidateTransferError) {
            // Transaction found but is invalid
            console.error('Transaction found but is invalid', e)
            toast({
              title: "Invalid Transaction",
              description: "The transaction was found but is invalid. Please try again.",
              variant: "destructive",
            })
            clearInterval(interval)
            return;
          }
          console.error('Unknown error', e)
        }
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [reference, recipient, amount, toast])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Solana Pay QR Code</CardTitle>
        <CardDescription>Scan this QR code to make a payment</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {qr ? (
          <img src={qr} alt="QR Code" className="w-64 h-64" />
        ) : (
          <div className="w-64 h-64 bg-gray-200 animate-pulse" />
        )}
        <div className="mt-4 text-center">
          <p>Amount: {amount} SOL</p>
          <p>Recipient: {recipient}</p>
          <p>Label: {label}</p>
          <p>Message: {message}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={() => window.location.reload()}>Generate New QR Code</Button>
      </CardFooter>
    </Card>
  )
}

export function QRCodeGenerator() {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState(0)
  const [label, setLabel] = useState('')
  const [message, setMessage] = useState('')
  const [showQR, setShowQR] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowQR(true)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {!showQR ? (
        <Card>
          <CardHeader>
            <CardTitle>Generate Solana Pay QR Code</CardTitle>
            <CardDescription>Enter the payment details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  placeholder="Enter Solana address"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (SOL)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.000000001"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  placeholder="Enter label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Input
                  id="message"
                  placeholder="Enter message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">Generate QR Code</Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <QRCode recipient={recipient} amount={amount} label={label} message={message} />
      )}
    </div>
  )
}