import { useState, useEffect } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { createPaymentRequest, encodePaymentURI, generateQRCode } from '@/utils/solana-pay'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Image from 'next/image'
import { useToast } from "@/components/ui/use-toast"

interface OrderItem {
  name: string
  price: number
  quantity: number
}

interface CheckoutProps {
  orderItems: OrderItem[]
  recipientAddress: string
}

export default function Checkout({ orderItems, recipientAddress }: CheckoutProps) {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<'pending' | 'processing' | 'completed' | null>(null)

  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const { toast } = useToast()

  const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  useEffect(() => {
    if (publicKey) {
      generatePaymentQRCode()
    }
  }, [publicKey])

  const generatePaymentQRCode = async () => {
    setError(null)
    setQrCode(null)
    setIsLoading(true)

    try {
      const paymentRequest = await createPaymentRequest(
        recipientAddress,
        totalAmount,
        'Order Payment',
        'Thank you for your purchase!',
        'Checkout payment'
      )
      const qrCodeData = await generateQRCode(paymentRequest)
      setQrCode(qrCodeData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to proceed with the payment.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setTransactionStatus('pending')

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(recipientAddress),
          lamports: totalAmount * LAMPORTS_PER_SOL,
        })
      )

      const signature = await sendTransaction(transaction, connection)
      
      setTransactionStatus('processing')
      
      const result = await connection.confirmTransaction(signature, 'processed')
      
      if (result.value.err) {
        throw new Error('Transaction failed')
      }

      setTransactionStatus('completed')
      toast({
        title: "Payment Successful",
        description: "Your payment has been processed successfully.",
        variant: "default",
      })
    } catch (err) {
      console.error('Payment error:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred during payment')
      setTransactionStatus(null)
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Checkout</CardTitle>
        <CardDescription>Review your order and complete the payment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orderItems.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <span>{item.name} x{item.quantity}</span>
              <span>{item.price * item.quantity} SOL</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between items-center font-bold">
            <span>Total</span>
            <span>{totalAmount} SOL</span>
          </div>
        </div>
        <div className="mt-6">
          <Label htmlFor="recipient">Recipient Address</Label>
          <Input
            id="recipient"
            value={recipientAddress}
            readOnly
            className="mt-1"
          />
        </div>
        <div className="mt-6 flex justify-center">
          <WalletMultiButton />
        </div>
        {publicKey && (
          <Button
            onClick={handlePayment}
            className="w-full mt-4"
            disabled={isLoading || transactionStatus === 'processing' || transactionStatus === 'completed'}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : transactionStatus === 'completed' ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Payment Completed
              </>
            ) : (
              'Pay Now'
            )}
          </Button>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-center">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {qrCode && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Payment QR Code</h3>
            <Image src={qrCode} alt="Payment QR Code" width={200} height={200} />
          </div>
        )}
      </CardFooter>
    </Card>
  )
}