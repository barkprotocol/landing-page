import { useState, useEffect, useCallback } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Zap, Coins, RefreshCw, PlusCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Assuming these are defined elsewhere in your app
import { sendBlink, getUserBalance, getTokenInfo, getSPLTokens } from '@/lib/milton/milton-api'

interface UserBalance {
  miltonBalance: number
  usdcBalance: number
  solBalance: number
  [key: string]: number // For other SPL tokens
}

interface TokenInfo {
  milton: { price: number }
  usdc: { price: number }
  sol: { price: number }
  [key: string]: { price: number } // For other SPL tokens
}

interface SPLToken {
  mint: string
  symbol: string
  name: string
}

export default function MiltonBlink() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null)
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [tipPercentage, setTipPercentage] = useState(5)
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly')
  const [selectedToken, setSelectedToken] = useState<string>('MILTON')
  const [splTokens, setSplTokens] = useState<SPLToken[]>([])
  const [customTokenAddress, setCustomTokenAddress] = useState('')

  const fetchUserBalance = useCallback(async () => {
    if (!wallet.publicKey) return
    try {
      const balance = await getUserBalance(wallet.publicKey.toString())
      setUserBalance(balance)
    } catch (err) {
      console.error('Error fetching user balance:', err)
    }
  }, [wallet.publicKey])

  const fetchTokenInfo = useCallback(async () => {
    try {
      const info = await getTokenInfo()
      setTokenInfo(info)
    } catch (err) {
      console.error('Error fetching token info:', err)
    }
  }, [])

  const fetchSPLTokens = useCallback(async () => {
    if (!wallet.publicKey) return
    try {
      const tokens = await getSPLTokens(wallet.publicKey.toString())
      setSplTokens(tokens)
    } catch (err) {
      console.error('Error fetching SPL tokens:', err)
    }
  }, [wallet.publicKey])

  useEffect(() => {
    if (wallet.publicKey) {
      fetchUserBalance()
      fetchTokenInfo()
      fetchSPLTokens()
    }
  }, [wallet.publicKey, fetchUserBalance, fetchTokenInfo, fetchSPLTokens])

  const handleSendBlink = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setError("Wallet not connected")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const recipientPubkey = new PublicKey(recipient)
      const amountNumber = parseFloat(amount)
      
      if (isNaN(amountNumber) || amountNumber <= 0) {
        throw new Error("Invalid amount")
      }

      const tipAmount = (amountNumber * tipPercentage) / 100
      const totalAmount = amountNumber + tipAmount

      if (totalAmount > (userBalance?.[selectedToken.toLowerCase() + 'Balance'] || 0)) {
        throw new Error("Insufficient balance")
      }

      const result = await sendBlink({
        senderPublicKey: wallet.publicKey.toString(),
        recipientPublicKey: recipientPubkey.toString(),
        amount: totalAmount,
        tokenType: selectedToken,
        message,
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : undefined
      })

      setSuccess(`Blink sent successfully! Transaction ID: ${result.transactionId}`)
      fetchUserBalance()
    } catch (err) {
      setError(`Failed to send Blink: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCustomToken = async () => {
    try {
      const customTokenPublicKey = new PublicKey(customTokenAddress)
      // Here you would typically call an API to add the custom token to the user's account
      // For this example, we'll just add it to the local list
      setSplTokens([...splTokens, { mint: customTokenAddress, symbol: 'CUSTOM', name: 'Custom Token' }])
      setCustomTokenAddress('')
    } catch (err) {
      setError('Invalid token address')
    }
  }

  const renderBlinkForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>Send SPL tokens using Milton Platform</CardTitle>
        <CardDescription>Send tokens quickly with a message</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="recipient">Recipient</Label>
          <Input
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Recipient's Solana address"
          />
        </div>
        <div>
          <Label htmlFor="tokenType">Token Type</Label>
          <Select value={selectedToken} onValueChange={setSelectedToken}>
            <SelectTrigger>
              <SelectValue placeholder="Select Token" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MILTON">MILTON</SelectItem>
              <SelectItem value="USDC">USDC</SelectItem>
              <SelectItem value="SOL">SOL</SelectItem>
              {splTokens.map((token) => (
                <SelectItem key={token.mint} value={token.symbol}>
                  {token.name} ({token.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.1"
          />
        </div>
        <div>
          <Label htmlFor="message">Message</Label>
          <Input
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your Blink message"
          />
        </div>
        <div>
          <Label>Tip Percentage: {tipPercentage}%</Label>
          <Slider
            value={[tipPercentage]}
            onValueChange={(value) => setTipPercentage(value[0])}
            max={20}
            step={1}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="recurring"
            checked={isRecurring}
            onCheckedChange={setIsRecurring}
          />
          <Label htmlFor="recurring">Recurring Blink</Label>
        </div>
        {isRecurring && (
          <div>
            <Label htmlFor="recurringFrequency">Frequency</Label>
            <Select value={recurringFrequency} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setRecurringFrequency(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="flex justify-between w-full text-sm text-gray-600">
          <span>MILTON: {userBalance?.miltonBalance.toFixed(2) || 'Loading...'}</span>
          <span>USDC: ${userBalance?.usdcBalance.toFixed(2) || 'Loading...'}</span>
          <span>SOL: {userBalance?.solBalance.toFixed(4) || 'Loading...'}</span>
          <Button onClick={fetchUserBalance} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={handleSendBlink} className="w-full" disabled={isLoading}>
          <Zap className="mr-2 h-4 w-4" />
          {isLoading ? 'Sending...' : 'Send Blink'}
        </Button>
      </CardFooter>
    </Card>
  )

  const renderPriceInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle>Token Prices</CardTitle>
      </CardHeader>
      <CardContent>
        <p>MILTON Price: ${tokenInfo?.milton.price.toFixed(4) || 'Loading...'}</p>
        <p>USDC Price: ${tokenInfo?.usdc.price.toFixed(2) || 'Loading...'}</p>
        <p>SOL Price: ${tokenInfo?.sol.price.toFixed(2) || 'Loading...'}</p>
        {Object.entries(tokenInfo || {})
          .filter(([key]) => !['milton', 'usdc', 'sol'].includes(key))
          .map(([key, value]) => (
            <p key={key}>{key.toUpperCase()} Price: ${value.price.toFixed(4)}</p>
          ))}
      </CardContent>
    </Card>
  )

  const renderAddCustomToken = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Custom Token
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Custom SPL Token</DialogTitle>
          <DialogDescription>
            Enter the mint address of the SPL token you want to add.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tokenAddress" className="text-right">
              Token Address
            </Label>
            <Input
              id="tokenAddress"
              value={customTokenAddress}
              onChange={(e) => setCustomTokenAddress(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleAddCustomToken}>Add Token</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Tabs defaultValue="send">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send">Send Blink</TabsTrigger>
          <TabsTrigger value="info">Price Info</TabsTrigger>
          <TabsTrigger value="custom">Custom Tokens</TabsTrigger>
        </TabsList>
        <TabsContent value="send">
          {renderBlinkForm()}
        </TabsContent>
        <TabsContent value="info">
          {renderPriceInfo()}
        </TabsContent>
        <TabsContent value="custom">
          {renderAddCustomToken()}
        </TabsContent>
      </Tabs>
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mt-4">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}