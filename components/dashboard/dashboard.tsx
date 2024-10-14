'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Send, Gift, Shuffle, Plus, CreditCard, ImageIcon, Heart, Upload, QrCode, Zap, Wallet, BarChart, AlertCircle, Moon, Sun } from 'lucide-react'
import Image from 'next/image'
import { QRCodeGenerator } from '@/components/qr-code-generator'
import { TokenSelector } from '@/components/ui/milton/token-selector'
import { TransactionHistory } from '@/components/ui/milton/transaction-history'
import { NFTGallery } from '@/components/ui/milton/nft-gallery'
import { ScheduleTransactionModal } from '@/components/ui/milton/schedule-transaction-modal'
import { RecurringPaymentModal } from '@/components/ui/milton/recurring-payment-modal'

const FEE_PERCENTAGE = 0.15

const tokens = [
  { symbol: 'SOL', name: 'Solana', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png' },
  { symbol: 'USDC', name: 'USD Coin', icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
  { symbol: 'MILTON', name: 'Milton', icon: 'https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg' },
]

const sendSchema = z.object({
  amount: z.string().min(1, 'Amount is required').refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Amount must be a positive number'),
  recipient: z.string().min(1, 'Recipient address is required'),
  memo: z.string().optional(),
})

export default function BlinkboardDashboard() {
  const router = useRouter()
  const { connection } = useConnection()
  const wallet = useWallet()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(sendSchema)
  })
  const [activeTab, setActiveTab] = useState('send')
  const [selectedToken, setSelectedToken] = useState('SOL')
  const [showQRCode, setShowQRCode] = useState(false)
  const [marketPrices, setMarketPrices] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [currentAction, setCurrentAction] = useState<string | null>(null)
  const [transactionHistory, setTransactionHistory] = useState([])
  const [nftGallery, setNftGallery] = useState([])

  useEffect(() => {
    fetchMarketPrices()
    const interval = setInterval(fetchMarketPrices, 60000) // Update prices every minute
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (wallet.connected) {
      fetchTransactionHistory()
      fetchNFTGallery()
    }
  }, [wallet.connected])

  const fetchMarketPrices = async () => {
    try {
      const response = await fetch('/api/v1/blinkboard/market-prices')
      const data = await response.json()
      setMarketPrices(data)
    } catch (error) {
      console.error('Error fetching market prices:', error)
      toast({
        title: "Error",
        description: "Failed to fetch market prices. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const fetchTransactionHistory = async () => {
    try {
      const response = await fetch(`/api/v1/blinkboard/transaction-history?wallet=${wallet.publicKey?.toBase58()}`)
      const data = await response.json()
      setTransactionHistory(data)
    } catch (error) {
      console.error('Error fetching transaction history:', error)
      toast({
        title: "Error",
        description: "Failed to fetch transaction history. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const fetchNFTGallery = async () => {
    try {
      const response = await fetch(`/api/v1/blinkboard/nft-gallery?wallet=${wallet.publicKey?.toBase58()}`)
      const data = await response.json()
      setNftGallery(data)
    } catch (error) {
      console.error('Error fetching NFT gallery:', error)
      toast({
        title: "Error",
        description: "Failed to fetch NFT gallery. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleSendBlink = async (data) => {
    setCurrentAction('send')
    setShowConfirmModal(true)
  }

  const confirmAction = async () => {
    setShowConfirmModal(false)
    setIsLoading(true)
    try {
      let response
      switch (currentAction) {
        case 'send':
          response = await fetch('/api/v1/blinkboard/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, selectedToken }),
          })
          break
        // Add cases for other actions (gift, swap, etc.)
      }
      const result = await response.json()
      if (result.error) throw new Error(result.error)
      toast({
        title: "Success",
        description: `${currentAction.charAt(0).toUpperCase() + currentAction.slice(1)} action completed successfully!`,
      })
    } catch (error) {
      console.error(`Error performing ${currentAction} action:`, error)
      toast({
        title: "Error",
        description: `Failed to ${currentAction}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setCurrentAction(null)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        // Handle image upload logic here
      }
      reader.readAsDataURL(file)
    }
  }

  const generateSolanaPayUrl = (data) => {
    const baseUrl = 'solana:'
    const params = new URLSearchParams({
      recipient: data.recipient,
      amount: data.amount,
      'spl-token': selectedToken,
      memo: data.memo || '',
    })
    return `${baseUrl}${params.toString()}`
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <section className={`py-12 min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Blinkboard</h1>
            <div className="flex items-center space-x-4">
              <WalletMultiButton />
              <Button variant="outline" onClick={toggleDarkMode}>
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="outline" onClick={() => router.push('/')} className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Main
              </Button>
            </div>
          </div>

          <Card className="mb-8 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
            <CardHeader>
              <CardTitle className="text-2xl">Market Prices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(marketPrices).map(([token, price]) => (
                  <motion.div
                    key={token}
                    className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md dark:bg-gray-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex items-center">
                      <Image src={tokens.find(t => t.symbol === token)?.icon || ''} alt={token} width={24} height={24} className="mr-2" />
                      <span className="font-medium">{token}</span>
                    </div>
                    <span className="font-bold text-primary">${price.toFixed(2)}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7 mb-8">
              <TabsTrigger value="send"><Send className="mr-2 h-4 w-4" />Send</TabsTrigger>
              <TabsTrigger value="gift"><Gift className="mr-2 h-4 w-4" />Gift</TabsTrigger>
              <TabsTrigger value="swap"><Shuffle className="mr-2 h-4 w-4" />Swap</TabsTrigger>
              <TabsTrigger value="create"><Plus className="mr-2 h-4 w-4" />Create</TabsTrigger>
              <TabsTrigger value="payments"><CreditCard className="mr-2 h-4 w-4" />Payments</TabsTrigger>
              <TabsTrigger value="nft"><ImageIcon className="mr-2 h-4 w-4" />NFT</TabsTrigger>
              <TabsTrigger value="donations"><Heart className="mr-2 h-4 w-4" />Donations</TabsTrigger>
            </TabsList>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="send">
                  <Card>
                    <CardHeader>
                      <CardTitle>Send a Blink</CardTitle>
                      <CardDescription>Send funds instantly on the Solana network</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit(handleSendBlink)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="amount"
                              type="number"
                              {...register('amount')}
                              placeholder="0.00"
                              className="flex-grow"
                            />
                            <TokenSelector
                              value={selectedToken}
                              onValueChange={setSelectedToken}
                              tokens={tokens}
                            />
                          </div>
                          {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="recipient">Recipient Address</Label>
                          <Input
                            id="recipient"
                            type="text"
                            {...register('recipient')}
                            placeholder="Solana address"
                          />
                          {errors.recipient && <p className="text-red-500 text-sm">{errors.recipient.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="memo">Memo (Optional)</Label>
                          <Input
                            id="memo"
                            type="text"
                            {...register('memo')}
                            placeholder="Add a memo to your transaction"
                          />
                        </div>
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Fees</AlertTitle>
                          <AlertDescription>
                            A {FEE_PERCENTAGE}% fee + Solana network fee will be applied to this transaction.
                          </AlertDescription>
                        </Alert>
                        <div className="flex space-x-2">
                          <Button type="submit" className="flex-grow" disabled={isLoading || !wallet.connected}>
                            {isLoading ? (
                              <>
                                <Zap className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                Send Blink <Send className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setShowQRCode(!showQRCode)}>
                            <QrCode className="h-4 w-4" />
                          </Button>
                        </div>
                      </form>
                      {showQRCode && (
                        <div className="mt-4">
                          
                          <QRCodeGenerator url={generateSolanaPayUrl({ recipient: '', amount: '', memo: '' })} />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                {/* Add other TabsContent components for gift, swap, create, payments, nft, donations */}
              </motion.div>
            </AnimatePresence>
          </Tabs>

          <TransactionHistory transactions={transactionHistory} />
          <NFTGallery nfts={nftGallery} />
          
          <ScheduleTransactionModal />
          <RecurringPaymentModal />

          <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Action</DialogTitle>
                <DialogDescription>
                  Are you sure you want to proceed with this action?
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
                <Button onClick={confirmAction}>Confirm</Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </section>
  )
}