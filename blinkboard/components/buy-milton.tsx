'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { createTransferCheckedInstruction, getAssociatedTokenAddress, getMint, createAssociatedTokenAccountInstruction } from '@solana/spl-token'
import { createQR, encodeURL, TransferRequestURLFields, findReference, validateTransfer } from '@solana/pay'
import BigNumber from 'bignumber.js'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, ArrowLeft, ArrowRight, Loader2, RefreshCw } from 'lucide-react'
import { WalletButton } from "@/components/ui/wallet-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Token addresses (replace with actual addresses in production)
const MILTON_MINT_ADDRESS = new PublicKey('')
const USDC_TOKEN_ADDRESS = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')

// Exchange rate constants
const MILTON_TO_SOL_RATE = 0.00001
const SOL_TO_USD_RATE = 138.49 // Current Solana price in USD
const USDC_TO_USD_RATE = 1 // Assuming 1 USDC = 1 USD

// Logo and icon URLs
const LOGO_URL = "https://ucarecdn.com/e02d02d3-5ef9-436a-aab2-d67f026110ce/miltonicon.png"
const SOL_ICON_URL = "https://ucarecdn.com/7c8e5d6e-f3f6-4c12-9d1a-d9f9d8d1b4f9/solanaicon.png"
const USDC_ICON_URL = "https://ucarecdn.com/3a3c3d3b-3b3c-4c3d-8d3e-3f3g3h3i3j3k/usdcicon.png"
const MILTON_ICON_URL = "https://ucarecdn.com/e02d02d3-5ef9-436a-aab2-d67f026110ce/miltonicon.png"

export default function BuyMiltonPage() {
  const router = useRouter()
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const { toast } = useToast()
  const [miltonAmount, setMiltonAmount] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentCurrency, setPaymentCurrency] = useState('SOL')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [exchangeRates, setExchangeRates] = useState({
    SOL: MILTON_TO_SOL_RATE,
    USDC: MILTON_TO_SOL_RATE * SOL_TO_USD_RATE
  })

  const fetchExchangeRates = useCallback(async () => {
    // In a real-world scenario, you would fetch the latest rates from an API
    // For now, we'll use our constant rates
    setExchangeRates({
      SOL: MILTON_TO_SOL_RATE,
      USDC: MILTON_TO_SOL_RATE * SOL_TO_USD_RATE
    })
  }, [])

  useEffect(() => {
    fetchExchangeRates()
  }, [fetchExchangeRates])

  const generateQRCode = useCallback(async () => {
    if (miltonAmount && publicKey) {
      const amount = parseFloat(miltonAmount) * exchangeRates[paymentCurrency as keyof typeof exchangeRates]
      setPaymentAmount(amount.toFixed(6))

      const reference = new Uint8Array(32)
      window.crypto.getRandomValues(reference)

      const transferFields: TransferRequestURLFields = {
        recipient: MILTON_MINT_ADDRESS,
        amount: new BigNumber(amount),
        splToken: paymentCurrency === 'USDC' ? USDC_TOKEN_ADDRESS : undefined,
        reference,
        label: 'Milton Token Purchase',
        message: `Purchase ${miltonAmount} MILTON tokens`,
      }

      const url = encodeURL(transferFields)
      const qr = createQR(url)
      const qrCodeOptions = { width: 256, height: 256 }
      const qrCodeDataUrl = await qr.toDataURL(qrCodeOptions)
      setQrCode(qrCodeDataUrl)
    }
  }, [miltonAmount, publicKey, paymentCurrency, exchangeRates])

  useEffect(() => {
    generateQRCode()
  }, [generateQRCode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to buy Milton tokens.",
        variant: "destructive",
      })
      return
    }

    if (!miltonAmount || parseFloat(miltonAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount of Milton tokens to buy.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setProgress(0)

    try {
      const miltonMint = await getMint(connection, MILTON_MINT_ADDRESS)
      const buyerMiltonAccount = await getAssociatedTokenAddress(MILTON_MINT_ADDRESS, publicKey)

      let transaction = new Transaction()

      // Check if the buyer's Milton token account exists, if not, create it
      const buyerMiltonAccountInfo = await connection.getAccountInfo(buyerMiltonAccount)
      if (!buyerMiltonAccountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            buyerMiltonAccount,
            publicKey,
            MILTON_MINT_ADDRESS
          )
        )
      }

      if (paymentCurrency === 'SOL') {
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: MILTON_MINT_ADDRESS,
            lamports: Math.floor(parseFloat(paymentAmount) * LAMPORTS_PER_SOL)
          })
        )
      } else if (paymentCurrency === 'USDC') {
        const buyerUsdcAccount = await getAssociatedTokenAddress(USDC_TOKEN_ADDRESS, publicKey)
        const usdcMint = await getMint(connection, USDC_TOKEN_ADDRESS)

        transaction.add(
          createTransferCheckedInstruction(
            buyerUsdcAccount,
            USDC_TOKEN_ADDRESS,
            MILTON_MINT_ADDRESS,
            publicKey,
            Math.floor(parseFloat(paymentAmount) * 10 ** usdcMint.decimals),
            usdcMint.decimals
          )
        )
      }

      // Add instruction to send Milton tokens to the buyer
      transaction.add(
        createTransferCheckedInstruction(
          MILTON_MINT_ADDRESS,
          MILTON_MINT_ADDRESS,
          buyerMiltonAccount,
          publicKey,
          Math.floor(parseFloat(miltonAmount) * 10 ** miltonMint.decimals),
          miltonMint.decimals
        )
      )

      const signature = await sendTransaction(transaction, connection)
      const latestBlockhash = await connection.getLatestBlockhash()
      await connection.confirmTransaction({
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        signature
      })

      toast({
        title: "Purchase Successful!",
        description: `You have successfully purchased ${miltonAmount} MILTON tokens.`,
      })
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Transaction Failed",
        description: "An error occurred while processing your transaction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setProgress(100)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold flex items-center">
            <Image src={LOGO_URL} alt="Milton Logo" width={40} height={40} className="mr-2" />
            Buy Milton Tokens
          </h1>
          <div className="flex items-center space-x-4">
            <Button onClick={() => router.push('/')} variant="outline" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Back to Home
            </Button>
            <WalletButton />
          </div>
        </div>

        {!publicKey && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Wallet not connected</AlertTitle>
            <AlertDescription>
              Please connect your wallet to buy Milton tokens.
            </AlertDescription>
          </Alert>
        )}

        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Image src={MILTON_ICON_URL} alt="Milton Icon" width={24} height={24} className="mr-2" />
              Purchase Milton Tokens
            </CardTitle>
            <CardDescription>Enter the amount of MILTON you want to buy.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="milton-amount">MILTON Amount</Label>
                <Input
                  id="milton-amount"
                  type="number"
                  placeholder="Enter MILTON amount"
                  value={miltonAmount}
                  onChange={(e) => setMiltonAmount(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-currency">Payment Currency</Label>
                <Select
                  value={paymentCurrency}
                  onValueChange={setPaymentCurrency}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="payment-currency">
                    <SelectValue placeholder="Select payment currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOL">
                      <div className="flex items-center">
                        <Image src={SOL_ICON_URL} alt="SOL Icon" width={16} height={16} className="mr-2" />
                        SOL
                      </div>
                    </SelectItem>
                    <SelectItem value="USDC">
                      <div className="flex items-center">
                        <Image src={USDC_ICON_URL} alt="USDC Icon" width={16} height={16} className="mr-2" />
                        USDC
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-amount">{paymentCurrency} Amount</Label>
                <Input
                  id="payment-amount"
                  type="text"
                  value={paymentAmount}
                  readOnly
                  disabled
                />
              </div>
              {qrCode && (
                <div className="flex justify-center">
                  <Image src={qrCode} alt="Payment QR Code" width={200} height={200} />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={!publicKey || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Buy MILTON
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-start">
            <div className="w-full text-sm text-muted-foreground mb-2">
              <p>Exchange Rates:</p>
              <p className="flex items-center">
                <Image src={MILTON_ICON_URL} alt="Milton Icon" width={16} height={16} className="mr-2" />
                1 MILTON = {exchangeRates.SOL.toFixed(6)} SOL (${(exchangeRates.SOL * SOL_TO_USD_RATE).toFixed(2)} USD)
              </p>
              <p className="flex items-center">
                <Image src={MILTON_ICON_URL} alt="Milton Icon" width={16} height={16} className="mr-2" />
                1 MILTON = {exchangeRates.USDC.toFixed(6)} USDC
              </p>
              <p className="flex items-center">
                <Image src={SOL_ICON_URL} alt="SOL Icon" width={16} height={16} className="mr-2" />
                1 SOL = ${SOL_TO_USD_RATE.toFixed(2)} USD
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchExchangeRates} className="self-end">
              <RefreshCw className="mr-2  h-4 w-4" />
              Refresh Rates
            </Button>
          </CardFooter>
        </Card>
        {isSubmitting && (
          <div className="mt-4 max-w-md  mx-auto">
            
            <Progress value={progress} className="w-full" />
          </div>
        )}
      </motion.div>
    </div>
  )
}