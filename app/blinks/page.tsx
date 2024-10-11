'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, ArrowLeft, Zap, Gift, Image as ImageIcon, Heart, Send, FileText, Users, Loader2, Info, Check, Calendar, CreditCard, Repeat } from 'lucide-react'
import { WalletButton } from "@/components/ui/wallet-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"

type BlinkType = 'payment' | 'gift' | 'nft' | 'donation' | 'transaction' | 'memo' | 'crowdfunding' | 'subscription'

const tabIcons = {
  payment: Send,
  gift: Gift,
  nft: ImageIcon,
  donation: Heart,
  transaction: Zap,
  memo: FileText,
  crowdfunding: Users,
  subscription: Repeat,
}

const SOLANA_NETWORK = 'devnet'
const SOLANA_RPC_URL = 'https://api.devnet.solana.com'

const currencyIcons = {
  SOL: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  USDC: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
  MILTON: 'https://ucarecdn.com/e02d02d3-5ef9-436a-aab2-d67f026110ce/miltonicon.png',
}

export default function EnhancedGeneratorPage() {
  const router = useRouter()
  const wallet = useWallet()
  const { publicKey, signTransaction } = wallet
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<BlinkType>('payment')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isAdvancedMode, setIsAdvancedMode] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const [formData, setFormData] = useState({
    payment: { name: '', amount: '', currency: 'SOL', memo: '', recipient: '', paymentMethod: 'wallet' },
    gift: { name: '', amount: '', currency: 'SOL', recipient: '', message: '' },
    nft: { name: '', description: '', image: null as File | null, attributes: [] },
    donation: { name: '', amount: '', currency: 'SOL', cause: '', anonymous: false },
    transaction: { name: '', amount: '', currency: 'SOL', recipient: '', schedule: 'immediate' },
    memo: { title: '', content: '', tags: [] },
    crowdfunding: { name: '', goal: '', currency: 'SOL', description: '', category: 'disaster_relief', endDate: '' },
    subscription: { name: '', amount: '', currency: 'SOL', recipient: '', frequency: 'monthly', duration: 12 }
  })

  const updateFormData = (type: BlinkType, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }))
  }

  useEffect(() => {
    if (isSubmitting) {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress === 100) {
            clearInterval(timer)
            return 100
          }
          const diff = Math.random() * 10
          return Math.min(oldProgress + diff, 100)
        })
      }, 500)

      return () => {
        clearInterval(timer)
      }
    }
  }, [isSubmitting])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicKey || !signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a Blink.",
        variant: "destructive",
      })
      return
    }

    setShowConfirmDialog(true)
  }

  const confirmSubmit = async () => {
    setShowConfirmDialog(false)
    setIsSubmitting(true)
    setProgress(0)

    try {
      const connection = new Connection(SOLANA_RPC_URL, 'confirmed')

      let transaction: Transaction
      let signature: string

      switch (activeTab) {
        case 'payment':
          transaction = await createPaymentTransaction(connection, publicKey, formData.payment)
          break
        case 'gift':
          transaction = await createGiftTransaction(connection, publicKey, formData.gift)
          break
        case 'nft':
          transaction = await createNFTTransaction(connection, publicKey, formData.nft)
          break
        case 'donation':
          transaction = await createDonationTransaction(connection, publicKey, formData.donation)
          break
        case 'transaction':
          transaction = await createGeneralTransaction(connection, publicKey, formData.transaction)
          break
        case 'memo':
          transaction = await createMemoTransaction(connection, publicKey, formData.memo)
          break
        case 'crowdfunding':
          transaction = await createCrowdfundingTransaction(connection, publicKey, formData.crowdfunding)
          break
        case 'subscription':
          transaction = await createSubscriptionTransaction(connection, publicKey, formData.subscription)
          break
        default:
          throw new Error('Invalid Blink type')
      }

      const signedTransaction = await signTransaction(transaction)
      signature = await connection.sendRawTransaction(signedTransaction.serialize())

      await connection.confirmTransaction(signature, 'confirmed')

      toast({
        title: "Blink Created!",
        description: (
          <div className="mt-2 flex items-center">
            <Check className="mr-2 h-4 w-4 text-green-500" />
            <span>
              Your {activeTab} Blink has been created successfully.
              <a
                href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-blue-500 hover:underline"
              >
                View on Solana Explorer
              </a>
            </span>
          </div>
        ),
      })
      
      setTimeout(() => router.push('/'), 1500)
    } catch (error) {
      console.error('Error creating Blink:', error)
      toast({
        title: "Error Creating Blink",
        description: `An error occurred while creating your Blink: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setProgress(100)
    }
  }

  const createPaymentTransaction = async (connection: Connection, fromPubkey: PublicKey, data: typeof formData.payment) => {
    const toPubkey = new PublicKey(data.recipient)
    const lamports = parseFloat(data.amount) * LAMPORTS_PER_SOL

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports,
      })
    )

    if (data.memo) {
      transaction.add(
        new Transaction().add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports: 0,
          })
        ).add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports: 0,
          })
        )
      )
    }

    return transaction
  }

  const createGiftTransaction = async (connection: Connection, fromPubkey: PublicKey, data: typeof formData.gift) => {
    const toPubkey = new PublicKey(data.recipient)
    const lamports = parseFloat(data.amount) * LAMPORTS_PER_SOL

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports,
      })
    )

    if (data.message) {
      transaction.add(
        new Transaction().add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports: 0,
          })
        ).add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports: 0,
          })
        )
      )
    }

    return transaction
  }

  const createNFTTransaction = async (connection: Connection, fromPubkey: PublicKey, data: typeof formData.nft) => {
    // Placeholder for NFT minting logic
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey: fromPubkey,
        lamports: 0,
      })
    )

    return transaction
  }

  const createDonationTransaction = async (connection: Connection, fromPubkey: PublicKey, data: typeof formData.donation) => {
    const toPubkey = new PublicKey('DonationReceiverAddressHere')
    const lamports = parseFloat(data.amount) * LAMPORTS_PER_SOL

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports,
      })
    )

    return transaction
  }

  const createGeneralTransaction = async (connection: Connection, fromPubkey: PublicKey, data: typeof formData.transaction) => {
    const toPubkey = new PublicKey(data.recipient)
    const lamports = parseFloat(data.amount) * LAMPORTS_PER_SOL

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports,
      })
    )

    return transaction
  }

  const createMemoTransaction = async (connection: Connection, fromPubkey: PublicKey, data: typeof formData.memo) => {
    const transaction = new Transaction().add(
      new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey: fromPubkey,
          lamports: 0,
        })
      )
    )

    return transaction
  }

  const createCrowdfundingTransaction = async (connection: Connection, fromPubkey: PublicKey, data: typeof formData.crowdfunding) => {
    // Placeholder for crowdfunding logic
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey: fromPubkey,
        lamports: 0,
      })
    )

    return transaction
  }

  const createSubscriptionTransaction = async (connection: Connection, fromPubkey: PublicKey, data: typeof formData.subscription) => {
    // Placeholder for subscription logic
    const toPubkey = new PublicKey(data.recipient)
    const lamports = parseFloat(data.amount) * LAMPORTS_PER_SOL

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports,
      })
    )

    return transaction
  }

  const formIsValid = useCallback(() => {
    const data = formData[activeTab]
    switch (activeTab) {
      case 'payment':
        return data.name && data.amount && data.currency && data.recipient && data.paymentMethod
      case 'gift':
        return data.name && data.amount && data.currency && data.recipient
      case 'nft':
        return data.name && data.description && data.image
      case 'donation':
        return data.name && data.amount && data.currency && data.cause
      case 'transaction':
        return data.name && data.amount && data.currency && data.recipient
      case 'memo':
        return data.title && data.content
      case 'crowdfunding':
        return data.name && data.goal && data.currency && data.description && data.category
      case 'subscription':
        return data.name && data.amount && data.currency && data.recipient && data.frequency
      default:
        return false
    }
  }, [activeTab, formData])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold flex items-center text-foreground mb-4 sm:mb-0">
              <Zap className="mr-2 h-8 w-8 text-primary" />
              Create a Blink
            </h1>
            <div className="flex items-center space-x-4">
              <Button onClick={() => router.push('/dashboard')} variant="outline" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                Back to Dashboard
              </Button>
              <WalletButton />
            </div>
          
          </div>

          {!publicKey && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Wallet not connected</AlertTitle>
              <AlertDescription>
                Please connect your wallet to create a Blink.
              </AlertDescription>
            </Alert>
          )}

          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Generate a New Blink</CardTitle>
              <CardDescription>Choose a Blink type and fill in the details to create your Blink on the Solana blockchain.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as BlinkType)}>
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                  {Object.entries(tabIcons).map(([key, Icon]) => (
                    <TabsTrigger key={key} value={key} className="w-full">
                      <Icon className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TabsContent value="payment" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="payment-name">Payment Name</Label>
                          <Input
                            id="payment-name"
                            placeholder="Enter a name for your payment"
                            value={formData.payment.name}
                            onChange={(e) => updateFormData('payment', 'name', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="payment-amount">Amount</Label>
                          <Input
                            id="payment-amount"
                            type="number"
                            placeholder="Enter amount"
                            value={formData.payment.amount}
                            onChange={(e) => updateFormData('payment', 'amount', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="payment-currency">Currency</Label>
                          <Select value={formData.payment.currency} onValueChange={(value) => updateFormData('payment', 'currency', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(currencyIcons).map(([currency, iconUrl]) => (
                                <SelectItem key={currency} value={currency}>
                                  <div className="flex items-center">
                                    <img src={iconUrl} alt={currency} className="w-5 h-5 mr-2" />
                                    {currency}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="payment-recipient">Recipient</Label>
                          <Input
                            id="payment-recipient"
                            placeholder="Enter recipient's wallet address"
                            value={formData.payment.recipient}
                            onChange={(e) => updateFormData('payment', 'recipient', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Payment Method</Label>
                          <RadioGroup
                            value={formData.payment.paymentMethod}
                            onValueChange={(value) => updateFormData('payment', 'paymentMethod', value)}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="wallet" id="wallet" />
                              <Label htmlFor="wallet">Wallet</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="card" id="card" />
                              <Label htmlFor="card">Credit Card</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        {isAdvancedMode && (
                          <div className="space-y-2">
                            <Label htmlFor="payment-memo">Memo (Optional)</Label>
                            <Input
                              id="payment-memo"
                              placeholder="Add a memo to your payment"
                              value={formData.payment.memo}
                              onChange={(e) => updateFormData('payment', 'memo', e.target.value)}
                            />
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="subscription" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="subscription-name">Subscription Name</Label>
                          <Input
                            id="subscription-name"
                            placeholder="Enter a name for your subscription"
                            value={formData.subscription.name}
                            onChange={(e) => updateFormData('subscription', 'name', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subscription-amount">Amount</Label>
                          <Input
                            id="subscription-amount"
                            type="number"
                            placeholder="Enter amount"
                            value={formData.subscription.amount}
                            onChange={(e) => updateFormData('subscription', 'amount', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subscription-currency">Currency</Label>
                          <Select value={formData.subscription.currency} onValueChange={(value) => updateFormData('subscription', 'currency', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(currencyIcons).map(([currency, iconUrl]) => (
                                <SelectItem key={currency} value={currency}>
                                  <div className="flex items-center">
                                    <img src={iconUrl} alt={currency} className="w-5 h-5 mr-2" />
                                    {currency}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subscription-recipient">Recipient</Label>
                          <Input
                            id="subscription-recipient"
                            placeholder="Enter recipient's wallet address"
                            value={formData.subscription.recipient}
                            onChange={(e) => updateFormData('subscription', 'recipient', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Frequency</Label>
                          <RadioGroup
                            value={formData.subscription.frequency}
                            onValueChange={(value) => updateFormData('subscription', 'frequency', value)}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="weekly" id="weekly" />
                              <Label htmlFor="weekly">Weekly</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="monthly" id="monthly" />
                              <Label htmlFor="monthly">Monthly</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yearly" id="yearly" />
                              <Label htmlFor="yearly">Yearly</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subscription-duration">Duration (months)</Label>
                          <div className="flex items-center space-x-4">
                            <Slider
                              id="subscription-duration"
                              min={1}
                              max={24}
                              step={1}
                              value={[formData.subscription.duration]}
                              onValueChange={(value) => updateFormData('subscription', 'duration', value[0])}
                            />
                            <span>{formData.subscription.duration} months</span>
                          </div>
                        </div>
                      </TabsContent>

                      {/* Similar TabsContent for other Blink types (gift, nft, donation, transaction, memo, crowdfunding) */}
                    </motion.div>
                  </AnimatePresence>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="advanced-mode"
                        checked={isAdvancedMode}
                        onCheckedChange={setIsAdvancedMode}
                      />
                      <Label htmlFor="advanced-mode">Advanced Mode</Label>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Advanced mode enables additional options for each Blink type.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Button type="submit" className="w-full" disabled={!publicKey || !formIsValid() || isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Blink...
                      </>
                    ) : (
                      'Create Blink'
                    )}
                  </Button>
                </form>
              </Tabs>
            </CardContent>
            <CardFooter>
              <div className="w-full flex justify-between items-center">
                <Badge variant="outline" className="text-xs">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Blink
                </Badge>
                {isAdvancedMode && (
                  <Badge variant="secondary" className="text-xs">
                    Advanced Mode
                  </Badge>
                )}
              </div>
            </CardFooter>
          </Card>
          {isSubmitting && (
            <div className="mt-4">
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </motion.div>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Blink Creation</DialogTitle>
            <DialogDescription>
              Are you sure you want to create this {activeTab} Blink?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Please review the details before confirming:
            </p>
            <ul className="mt-2 space-y-1">
              {Object.entries(formData[activeTab]).map(([key, value]) => (
                <li key={key} className="text-sm">
                  <span className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}:</span> {value.toString()}
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button onClick={confirmSubmit}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}