'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Gift, Zap, Heart } from 'lucide-react'

const API_BASE_URL = 'https://miltonprotocol.com/api/demo/'

interface TokenInfo {
  milton: {
    supply: number
    decimals: number
    price: number
    treasuryBalance: number
  }
  usdc: {
    supply: number
    decimals: number
    price: number
    treasuryBalance: number
  }
}

interface TransactionRequest {
  buyerPublicKey: string
  miltonAmount: number
  paymentCurrency: 'SOL' | 'USDC'
  paymentAmount: number
  slippageTolerance: number
}

interface TransactionResponse {
  transaction: string
  transactionId: string
  feeEstimate: number
  expiresAt: string
}

interface DonationRequest {
  senderPublicKey: string
  recipientPublicKey: string
  amount: number
  donationType: 'gift' | 'blink' | 'heart'
  message?: string
}

export default function Component() {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [transactionRequest, setTransactionRequest] = useState<TransactionRequest>({
    buyerPublicKey: '',
    miltonAmount: 0,
    paymentCurrency: 'SOL',
    paymentAmount: 0,
    slippageTolerance: 0.5,
  })
  const [transactionResponse, setTransactionResponse] = useState<TransactionResponse | null>(null)
  const [donationRequest, setDonationRequest] = useState<DonationRequest>({
    senderPublicKey: '',
    recipientPublicKey: '',
    amount: 0,
    donationType: 'gift',
    message: '',
  })
  const { toast } = useToast()

  const fetchTokenInfo = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/milton/tokens`)
      if (!response.ok) {
        throw new Error('Failed to fetch token info')
      }
      const data: TokenInfo = await response.json()
      setTokenInfo(data)
      toast({
        title: 'Token Info Fetched',
        description: 'Successfully retrieved Milton and USDC token information.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch token information. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createTransaction = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/milton/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionRequest),
      })
      if (!response.ok) {
        throw new Error('Failed to create transaction')
      }
      const data: TransactionResponse = await response.json()
      setTransactionResponse(data)
      toast({
        title: 'Transaction Created',
        description: `Transaction ID: ${data.transactionId}`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create transaction. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sendDonation = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/milton/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donationRequest),
      })
      if (!response.ok) {
        throw new Error('Failed to send donation')
      }
      const data = await response.json()
      toast({
        title: 'Donation Sent',
        description: `Donation ID: ${data.donationId}`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send donation. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Milton Token Info</CardTitle>
        </CardHeader>
        <CardContent>
          {tokenInfo ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold">Milton</h3>
                <p>Supply: {tokenInfo.milton.supply}</p>
                <p>Price: ${tokenInfo.milton.price}</p>
                <p>Treasury Balance: {tokenInfo.milton.treasuryBalance}</p>
              </div>
              <div>
                <h3 className="font-bold">USDC</h3>
                <p>Supply: {tokenInfo.usdc.supply}</p>
                <p>Price: ${tokenInfo.usdc.price}</p>
                <p>Treasury Balance: {tokenInfo.usdc.treasuryBalance}</p>
              </div>
            </div>
          ) : (
            <Alert>
              <AlertTitle>No Data</AlertTitle>
              <AlertDescription>
                No token info available. Click the button below to fetch.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={fetchTokenInfo} disabled={isLoading}>
            {isLoading ? 'Fetching...' : 'Fetch Token Info'}
          </Button>
        </CardFooter>
      </Card>

      <Tabs defaultValue="transaction">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transaction">Create Transaction</TabsTrigger>
          <TabsTrigger value="donation">Send Donation</TabsTrigger>
        </TabsList>
        <TabsContent value="transaction">
          <Card>
            <CardHeader>
              <CardTitle>Create Milton Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Buyer Public Key"
                  value={transactionRequest.buyerPublicKey}
                  onChange={(e) => setTransactionRequest({ ...transactionRequest, buyerPublicKey: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Milton Amount"
                  value={transactionRequest.miltonAmount || ''}
                  onChange={(e) => setTransactionRequest({ ...transactionRequest, miltonAmount: parseFloat(e.target.value) || 0 })}
                />
                <Select
                  value={transactionRequest.paymentCurrency}
                  onValueChange={(value: 'SOL' | 'USDC') => setTransactionRequest({ ...transactionRequest, paymentCurrency: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Payment Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOL">SOL</SelectItem>
                    <SelectItem value="USDC">USDC</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Payment Amount"
                  value={transactionRequest.paymentAmount || ''}
                  onChange={(e) => setTransactionRequest({ ...transactionRequest, paymentAmount: parseFloat(e.target.value) || 0 })}
                />
                <Input
                  type="number"
                  placeholder="Slippage Tolerance (%)"
                  value={transactionRequest.slippageTolerance || ''}
                  onChange={(e) => setTransactionRequest({ ...transactionRequest, slippageTolerance: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={createTransaction} disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Transaction'}
              </Button>
            </CardFooter>
          </Card>

          {transactionResponse && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Transaction Response</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Transaction ID: {transactionResponse.transactionId}</p>
                <p>Fee Estimate: {transactionResponse.feeEstimate}</p>
                <p>Expires At: {new Date(transactionResponse.expiresAt).toLocaleString()}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="donation">
          <Card>
            <CardHeader>
              <CardTitle>Send Donation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Sender Public Key"
                  value={donationRequest.senderPublicKey}
                  onChange={(e) => setDonationRequest({ ...donationRequest, senderPublicKey: e.target.value })}
                />
                <Input
                  placeholder="Recipient Public Key"
                  value={donationRequest.recipientPublicKey}
                  onChange={(e) => setDonationRequest({ ...donationRequest, recipientPublicKey: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={donationRequest.amount || ''}
                  onChange={(e) => setDonationRequest({ ...donationRequest, amount: parseFloat(e.target.value) || 0 })}
                />
                <Select
                  value={donationRequest.donationType}
                  onValueChange={(value: 'gift' | 'blink' | 'heart') => setDonationRequest({ ...donationRequest, donationType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Donation Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gift">
                      <div className="flex items-center">
                        <Gift className="mr-2 h-4 w-4" />
                        Gift
                      </div>
                    </SelectItem>
                    <SelectItem value="blink">
                      <div className="flex items-center">
                        <Zap className="mr-2 h-4 w-4" />
                        Blink
                      </div>
                    </SelectItem>
                    <SelectItem value="heart">
                      <div className="flex items-center">
                        <Heart className="mr-2 h-4 w-4" />
                        Heart
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="space-y-2">
                  <Label htmlFor="message">Message (optional)</Label>
                  <Input
                    id="message"
                    placeholder="Enter your message"
                    value={donationRequest.message}
                    onChange={(e) => setDonationRequest({ ...donationRequest, message: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={sendDonation} disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Donation'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}