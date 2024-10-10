'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, ArrowLeft, Zap, Gift, Image as ImageIcon, Heart, Send, FileText, Users, Loader2, Info } from 'lucide-react'
import { WalletButton } from "@/components/ui/wallet-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

type BlinkType = 'payment' | 'gift' | 'nft' | 'donation' | 'transaction' | 'memo' | 'crowdfunding'

const tabIcons = {
  payment: Send,
  gift: Gift,
  nft: ImageIcon,
  donation: Heart,
  transaction: Zap,
  memo: FileText,
  crowdfunding: Users,
}

export default function GenerateBlinksPage() {
  const router = useRouter()
  const { publicKey } = useWallet()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<BlinkType>('payment')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isAdvancedMode, setIsAdvancedMode] = useState(false)

  const [paymentData, setPaymentData] = useState({ name: '', amount: '', currency: 'SOL', memo: '' })
  const [giftData, setGiftData] = useState({ name: '', amount: '', currency: 'SOL', recipient: '', message: '' })
  const [nftData, setNftData] = useState({ name: '', description: '', image: null as File | null, attributes: [] })
  const [donationData, setDonationData] = useState({ name: '', amount: '', currency: 'SOL', cause: '', anonymous: false })
  const [transactionData, setTransactionData] = useState({ name: '', amount: '', currency: 'SOL', recipient: '', schedule: 'immediate' })
  const [memoData, setMemoData] = useState({ title: '', content: '', tags: [] })
  const [crowdfundingData, setCrowdfundingData] = useState({ name: '', goal: '', currency: 'SOL', description: '', category: 'disaster_relief', endDate: '' })

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
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a Blink.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setProgress(0)

    let blinkData
    switch (activeTab) {
      case 'payment':
        blinkData = paymentData
        break
      case 'gift':
        blinkData = giftData
        break
      case 'nft':
        blinkData = nftData
        break
      case 'donation':
        blinkData = donationData
        break
      case 'transaction':
        blinkData = transactionData
        break
      case 'memo':
        blinkData = memoData
        break
      case 'crowdfunding':
        blinkData = crowdfundingData
        break
    }

    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 3000))

    setIsSubmitting(false)
    setProgress(100)

    console.log('Creating Blink:', { type: activeTab, ...blinkData })
    toast({
      title: "Blink Created!",
      description: `Your ${activeTab} Blink has been created successfully.`,
    })
    
    // Redirect to the main-page after a short delay
    setTimeout(() => router.push('/'), 1500)
  }

  const formIsValid = () => {
    switch (activeTab) {
      case 'payment':
        return paymentData.name && paymentData.amount && paymentData.currency
      case 'gift':
        return giftData.name && giftData.amount && giftData.currency && giftData.recipient
      case 'nft':
        return nftData.name && nftData.description && nftData.image
      case 'donation':
        return donationData.name && donationData.amount && donationData.currency && donationData.cause
      case 'transaction':
        return transactionData.name && transactionData.amount && transactionData.currency && transactionData.recipient
      case 'memo':
        return memoData.title && memoData.content
      case 'crowdfunding':
        return crowdfundingData.name && crowdfundingData.goal && crowdfundingData.currency && crowdfundingData.description && crowdfundingData.category
      default:
        return false
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
              <TabsList className="grid grid-cols-3 lg:grid-cols-7 mb-4">
                {Object.entries(tabIcons).map(([key, Icon]) => (
                  <TabsTrigger key={key} value={key} className="flex items-center justify-center">
                    <Icon className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TabsContent value="payment">
                      <div className="space-y-2">
                        <Label htmlFor="payment-name">Payment Name</Label>
                        <Input
                          id="payment-name"
                          placeholder="Enter a name for your payment"
                          value={paymentData.name}
                          onChange={(e) => setPaymentData({...paymentData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="payment-amount">Amount</Label>
                        <Input
                          id="payment-amount"
                          type="number"
                          placeholder="Enter amount"
                          value={paymentData.amount}
                          onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="payment-currency">Currency</Label>
                        <Select value={paymentData.currency} onValueChange={(value) => setPaymentData({...paymentData, currency: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SOL">SOL</SelectItem>
                            <SelectItem value="USDC">USDC</SelectItem>
                            <SelectItem value="MILTON">MILTON</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {isAdvancedMode && (
                        <div className="space-y-2">
                          <Label htmlFor="payment-memo">Memo (Optional)</Label>
                          <Input
                            id="payment-memo"
                            placeholder="Add a memo to your payment"
                            value={paymentData.memo}
                            onChange={(e) => setPaymentData({...paymentData, memo: e.target.value})}
                          />
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="gift">
                      <div className="space-y-2">
                        <Label htmlFor="gift-name">Gift Name</Label>
                        <Input
                          id="gift-name"
                          placeholder="Enter a name for your gift"
                          value={giftData.name}
                          onChange={(e) => setGiftData({...giftData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gift-amount">Amount</Label>
                        <Input
                          id="gift-amount"
                          type="number"
                          placeholder="Enter amount"
                          value={giftData.amount}
                          onChange={(e) => setGiftData({...giftData, amount: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gift-currency">Currency</Label>
                        <Select value={giftData.currency} onValueChange={(value) => setGiftData({...giftData, currency: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SOL">SOL</SelectItem>
                            <SelectItem value="USDC">USDC</SelectItem>
                            <SelectItem value="MILTON">MILTON</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gift-recipient">Recipient</Label>
                        <Input
                          id="gift-recipient"
                          placeholder="Enter recipient's wallet address"
                          value={giftData.recipient}
                          onChange={(e) => setGiftData({...giftData, recipient: e.target.value})}
                        />
                      </div>
                      {isAdvancedMode && (
                        <div className="space-y-2">
                          <Label htmlFor="gift-message">Gift Message (Optional)</Label>
                          <Textarea
                            id="gift-message"
                            placeholder="Add a personal message to your gift"
                            value={giftData.message}
                            onChange={(e) => setGiftData({...giftData, message: e.target.value})}
                          />
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="nft">
                      <div className="space-y-2">
                        <Label htmlFor="nft-name">NFT Name</Label>
                        <Input
                          id="nft-name"
                          placeholder="Enter a name for your NFT"
                          value={nftData.name}
                          onChange={(e) => setNftData({...nftData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nft-description">Description</Label>
                        <Textarea
                          id="nft-description"
                          placeholder="Describe your NFT"
                          value={nftData.description}
                          onChange={(e) => setNftData({...nftData, description: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nft-image">Image</Label>
                        <Input
                          id="nft-image"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setNftData({...nftData, image: e.target.files ? e.target.files[0] : null})}
                        />
                      </div>
                      {isAdvancedMode && (
                        <div className="space-y-2">
                          <Label htmlFor="nft-attributes">Attributes (Optional)</Label>
                          <Input
                            id="nft-attributes"
                            placeholder="Enter attributes (comma-separated)"
                            value={nftData.attributes.join(', ')}
                            onChange={(e) => setNftData({...nftData, attributes: e.target.value.split(', ')})}
                          />
                        
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="donation">
                      <div className="space-y-2">
                        <Label htmlFor="donation-name">Donation Name</Label>
                        <Input
                          id="donation-name"
                          placeholder="Enter a name for your donation"
                          value={donationData.name}
                          onChange={(e) => setDonationData({...donationData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="donation-amount">Amount</Label>
                        <Input
                          id="donation-amount"
                          type="number"
                          placeholder="Enter amount"
                          value={donationData.amount}
                          onChange={(e) => setDonationData({...donationData, amount: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="donation-currency">Currency</Label>
                        <Select value={donationData.currency} onValueChange={(value) => setDonationData({...donationData, currency: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SOL">SOL</SelectItem>
                            <SelectItem value="USDC">USDC</SelectItem>
                            <SelectItem value="MILTON">MILTON</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="donation-cause">Cause</Label>
                        <Input
                          id="donation-cause"
                          placeholder="Enter the cause you're donating to"
                          value={donationData.cause}
                          onChange={(e) => setDonationData({...donationData, cause: e.target.value})}
                        />
                      </div>
                      {isAdvancedMode && (
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="donation-anonymous"
                            checked={donationData.anonymous}
                            onCheckedChange={(checked) => setDonationData({...donationData, anonymous: checked})}
                          />
                          <Label htmlFor="donation-anonymous">Make donation anonymous</Label>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="transaction">
                      <div className="space-y-2">
                        <Label htmlFor="transaction-name">Transaction Name</Label>
                        <Input
                          id="transaction-name"
                          placeholder="Enter a name for your transaction"
                          value={transactionData.name}
                          onChange={(e) => setTransactionData({...transactionData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transaction-amount">Amount</Label>
                        <Input
                          id="transaction-amount"
                          type="number"
                          placeholder="Enter amount"
                          value={transactionData.amount}
                          onChange={(e) => setTransactionData({...transactionData, amount: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transaction-currency">Currency</Label>
                        <Select value={transactionData.currency} onValueChange={(value) => setTransactionData({...transactionData, currency: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SOL">SOL</SelectItem>
                            <SelectItem value="USDC">USDC</SelectItem>
                            <SelectItem value="MILTON">MILTON</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transaction-recipient">Recipient</Label>
                        <Input
                          id="transaction-recipient"
                          placeholder="Enter recipient's wallet address"
                          value={transactionData.recipient}
                          onChange={(e) => setTransactionData({...transactionData, recipient: e.target.value})}
                        />
                      </div>
                      {isAdvancedMode && (
                        <div className="space-y-2">
                          <Label htmlFor="transaction-schedule">Schedule</Label>
                          <Select value={transactionData.schedule} onValueChange={(value) => setTransactionData({...transactionData, schedule: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select schedule" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediate">Immediate</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="memo">
                      <div className="space-y-2">
                        <Label htmlFor="memo-title">Memo Title</Label>
                        <Input
                          id="memo-title"
                          placeholder="Enter a title for your memo"
                          value={memoData.title}
                          onChange={(e) => setMemoData({...memoData, title: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="memo-content">Content</Label>
                        <Textarea
                          id="memo-content"
                          placeholder="Enter your memo content"
                          value={memoData.content}
                          onChange={(e) => setMemoData({...memoData, content: e.target.value})}
                        />
                      </div>
                      {isAdvancedMode && (
                        <div className="space-y-2">
                          <Label htmlFor="memo-tags">Tags (Optional)</Label>
                          <Input
                            id="memo-tags"
                            placeholder="Enter tags (comma-separated)"
                            value={memoData.tags.join(', ')}
                            onChange={(e) => setMemoData({...memoData, tags: e.target.value.split(', ')})}
                          />
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="crowdfunding">
                      <div className="space-y-2">
                        <Label htmlFor="crowdfunding-name">Campaign Name</Label>
                        <Input
                          id="crowdfunding-name"
                          placeholder="Enter a name for your crowdfunding campaign"
                          value={crowdfundingData.name}
                          onChange={(e) => setCrowdfundingData({...crowdfundingData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="crowdfunding-goal">Funding Goal</Label>
                        <Input
                          id="crowdfunding-goal"
                          type="number"
                          placeholder="Enter funding goal"
                          value={crowdfundingData.goal}
                          onChange={(e) => setCrowdfundingData({...crowdfundingData, goal: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="crowdfunding-currency">Currency</Label>
                        <Select value={crowdfundingData.currency} onValueChange={(value) => setCrowdfundingData({...crowdfundingData, currency: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SOL">SOL</SelectItem>
                            <SelectItem value="USDC">USDC</SelectItem>
                            <SelectItem value="MILTON">MILTON</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="crowdfunding-description">Description</Label>
                        <Textarea
                          id="crowdfunding-description"
                          placeholder="Describe your crowdfunding campaign"
                          value={crowdfundingData.description}
                          onChange={(e) => setCrowdfundingData({...crowdfundingData, description: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="crowdfunding-category">Category</Label>
                        <Select value={crowdfundingData.category} onValueChange={(value) => setCrowdfundingData({...crowdfundingData, category: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="disaster_relief">Disaster Relief</SelectItem>
                            <SelectItem value="charity">Charity</SelectItem>
                            <SelectItem value="global_health">Global Health</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {isAdvancedMode && (
                        <div className="space-y-2">
                          <Label htmlFor="crowdfunding-end-date">End Date</Label>
                          <Input
                            id="crowdfunding-end-date"
                            type="date"
                            value={crowdfundingData.endDate}
                            onChange={(e) => setCrowdfundingData({...crowdfundingData, endDate: e.target.value})}
                          />
                        </div>
                      )}
                    </TabsContent>
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
  )
}