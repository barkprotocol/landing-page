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
import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

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

const swapSchema = z.object({
  fromAmount: z.string().min(1, 'Amount is required').refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Amount must be a positive number'),
  toAmount: z.string().min(1, 'Amount is required').refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Amount must be a positive number'),
})

const createNFTSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  image: z.instanceof(File).refine((file) => file.size <= 5000000, `Max file size is 5MB.`),
})

const donateSchema = z.object({
  amount: z.string().min(1, 'Amount is required').refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Amount must be a positive number'),
  recipient: z.string().min(1, 'Recipient address is required'),
  message: z.string().optional(),
})

export default function BlinkboardDashboard() {
  const router = useRouter()
  const { connection } = useConnection()
  const wallet = useWallet()
  const { register: registerSend, handleSubmit: handleSubmitSend, formState: { errors: errorsSend } } = useForm({
    resolver: zodResolver(sendSchema)
  })
  const { register: registerSwap, handleSubmit: handleSubmitSwap, formState: { errors: errorsSwap } } = useForm({
    resolver: zodResolver(swapSchema)
  })
  const { register: registerCreateNFT, handleSubmit: handleSubmitCreateNFT, formState: { errors: errorsCreateNFT } } = useForm({
    resolver: zodResolver(createNFTSchema)
  })
  const { register: registerDonate, handleSubmit: handleSubmitDonate, formState: { errors: errorsDonate } } = useForm({
    resolver: zodResolver(donateSchema)
  })
  const [activeTab, setActiveTab] = useState('send')
  const [selectedToken, setSelectedToken] = useState('SOL')
  const [selectedSwapFromToken, setSelectedSwapFromToken] = useState('SOL')
  const [selectedSwapToToken, setSelectedSwapToToken] = useState('USDC')
  const [showQRCode, setShowQRCode] = useState(false)
  const [marketPrices, setMarketPrices] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [currentAction, setCurrentAction] = useState<string | null>(null)
  const [transactionHistory, setTransactionHistory] = useState([])
  const [nftGallery, setNftGallery] = useState([])
  const [tokenBalances, setTokenBalances] = useState<Record<string, number>>({})
  const [priceHistory, setPriceHistory] = useState([])

  useEffect(() => {
    fetchMarketPrices()
    fetchTokenBalances()
    fetchPriceHistory()
    const interval = setInterval(() => {
      fetchMarketPrices()
      fetchTokenBalances()
      fetchPriceHistory()
    }, 60000) // Update every minute
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
      setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTokenBalances = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/v1/blinkboard/token-balances?wallet=${wallet.publicKey?.toBase58()}`)
      const data = await response.json()
      setTokenBalances(data)
    } catch (error) {
      console.error('Error fetching token balances:', error)
      toast({
        title: "Error",
        description: "Failed to fetch token balances. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPriceHistory = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/v1/blinkboard/price-history')
      const data = await response.json()
      setPriceHistory(data)
    } catch (error) {
      console.error('Error fetching price history:', error)
      toast({
        title: "Error",
        description: "Failed to fetch price history. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTransactionHistory = async () => {
    try {
      setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
  }

  const fetchNFTGallery = async () => {
    try {
      setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendBlink = async (data) => {
    setCurrentAction('send')
    setShowConfirmModal(true)
  }

  const handleSwap = async (data) => {
    setCurrentAction('swap')
    setShowConfirmModal(true)
  }

  const handleCreateNFT = async (data) => {
    setCurrentAction('createNFT')
    setShowConfirmModal(true)
  }

  const handleDonate = async (data) => {
    setCurrentAction('donate')
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
        case 'swap':
          response = await fetch('/api/v1/blinkboard/swap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, fromToken: selectedSwapFromToken, toToken: selectedSwapToToken }),
          })
          break
        case 'createNFT':
          const formData = new FormData()
          formData.append('name', data.name)
          formData.append('description', data.description)
          formData.append('image', data.image)
          response = await fetch('/api/v1/blinkboard/create-nft', {
            method: 'POST',
            body: formData,
          })
          break
        case 'donate':
          response = await fetch('/api/v1/blinkboard/donate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, selectedToken }),
          })
          break
      }
      const result = await response.json()
      if (result.error) throw new Error(result.error)
      toast({
        title: "Success",
        description: `${currentAction.charAt(0).toUpperCase() + currentAction.slice(1)} action completed successfully!`,
      })
      fetchTokenBalances()
      fetchTransactionHistory()
      fetchNFTGallery()
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

          <Card className="mb-8 bg-white/50 backdrop-blur-sm  dark:bg-gray-800/50">
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

          <Card className="mb-8 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
            <CardHeader>
              <CardTitle className="text-2xl">Your Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(tokenBalances).map(([token, balance]) => (
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
                    <span className="font-bold text-primary">{balance.toFixed(4)}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50">
            <CardHeader>
              <CardTitle className="text-2xl">Price History</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={priceHistory}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="SOL" stroke="#8884d8" />
                  <Line type="monotone" dataKey="USDC" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="MILTON" stroke="#ffc658" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7 mb-8">
              <TabsTrigger value="send"><Send className="mr-2 h-4 w-4" />Send</TabsTrigger>
              <TabsTrigger value="swap"><Shuffle className="mr-2 h-4 w-4" />Swap</TabsTrigger>
              <TabsTrigger value="gift"><Gift className="mr-2 h-4 w-4" />Gift</TabsTrigger>
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
                      <form onSubmit={handleSubmitSend(handleSendBlink)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="amount"
                              type="number"
                              {...registerSend('amount')}
                              placeholder="0.00"
                              className="flex-grow"
                            />
                            <TokenSelector
                              value={selectedToken}
                              onValueChange={setSelectedToken}
                              tokens={tokens}
                            />
                          </div>
                          {errorsSend.amount && <p className="text-red-500 text-sm">{errorsSend.amount.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="recipient">Recipient Address</Label>
                          <Input
                            id="recipient"
                            type="text"
                            {...registerSend('recipient')}
                            placeholder="Solana address"
                          />
                          {errorsSend.recipient && <p className="text-red-500 text-sm">{errorsSend.recipient.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="memo">Memo (Optional)</Label>
                          <Input
                            id="memo"
                            type="text"
                            {...registerSend('memo')}
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
                <TabsContent value="swap">
                  <Card>
                    <CardHeader>
                      <CardTitle>Swap Tokens</CardTitle>
                      <CardDescription>Exchange one token for another</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmitSwap(handleSwap)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="fromAmount">From</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="fromAmount"
                              type="number"
                              {...registerSwap('fromAmount')}
                              placeholder="0.00"
                              className="flex-grow"
                            />
                            <TokenSelector
                              value={selectedSwapFromToken}
                              onValueChange={setSelectedSwapFromToken}
                              tokens={tokens}
                            />
                          </div>
                          {errorsSwap.fromAmount && <p className="text-red-500 text-sm">{errorsSwap.fromAmount.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="toAmount">To</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="toAmount"
                              type="number"
                              {...registerSwap('toAmount')}
                              placeholder="0.00"
                              className="flex-grow"
                            />
                            <TokenSelector
                              value={selectedSwapToToken}
                              onValueChange={setSelectedSwapToToken}
                              tokens={tokens}
                            />
                          </div>
                          {errorsSwap.toAmount && <p className="text-red-500 text-sm">{errorsSwap.toAmount.message}</p>}
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading || !wallet.connected}>
                          {isLoading ? (
                            <>
                              <Zap className="mr-2 h-4 w-4 animate-spin" />
                              Swapping...
                            </>
                          ) : (
                            <>
                              Swap Tokens <Shuffle className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="nft">
                  <Card>
                    <CardHeader>
                      <CardTitle>Create NFT</CardTitle>
                      <CardDescription>Mint a new NFT on the Solana blockchain</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmitCreateNFT(handleCreateNFT)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">NFT Name</Label>
                          <Input
                            id="name"
                            type="text"
                            {...registerCreateNFT('name')}
                            placeholder="Enter NFT name"
                          />
                          {errorsCreateNFT.name && <p className="text-red-500 text-sm">{errorsCreateNFT.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            {...registerCreateNFT('description')}
                            placeholder="Describe your NFT"
                          />
                          {errorsCreateNFT.description && <p className="text-red-500 text-sm">{errorsCreateNFT.description.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="image">Upload Image</Label>
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            {...registerCreateNFT('image')}
                          />
                          {errorsCreateNFT.image && <p className="text-red-500 text-sm">{errorsCreateNFT.image.message}</p>}
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading || !wallet.connected}>
                          {isLoading ? (
                            <>
                              <Zap className="mr-2 h-4 w-4 animate-spin" />
                              Creating NFT...
                            </>
                          ) : (
                            <>
                              Create NFT <Plus className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="donations">
                  <Card>
                    <CardHeader>
                      <CardTitle>Make a Donation</CardTitle>
                      <CardDescription>Support a cause or project with your tokens</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmitDonate(handleDonate)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Donation Amount</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="amount"
                              type="number"
                              {...registerDonate('amount')}
                              placeholder="0.00"
                              className="flex-grow"
                            />
                            <TokenSelector
                              value={selectedToken}
                              onValueChange={setSelectedToken}
                              tokens={tokens}
                            />
                          </div>
                          {errorsDonate.amount && <p className="text-red-500 text-sm">{errorsDonate.amount.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="recipient">Recipient Address</Label>
                          <Input
                            id="recipient"
                            type="text"
                            {...registerDonate('recipient')}
                            placeholder="Donation recipient address"
                          />
                          {errorsDonate.recipient && <p className="text-red-500 text-sm">{errorsDonate.recipient.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="message">Message (Optional)</Label>
                          <Textarea
                            id="message"
                            {...registerDonate('message')}
                            placeholder="Add a message to your donation"
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading || !wallet.connected}>
                          {isLoading ? (
                            <>
                              <Zap className="mr-2 h-4 w-4 animate-spin" />
                              Donating...
                            </>
                          ) : (
                            <>
                              Make Donation <Heart className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
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