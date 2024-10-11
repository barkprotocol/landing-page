'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey } from '@solana/web3.js'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Sidebar } from "@/components/ui/layout/sidebar"
import { Header } from "@/components/ui/layout/header"
import { fetchBalance, createBlink, fetchBlinks } from "@/lib/solana/solana-utils"
import { WalletButton } from "@/components/ui/wallet-button"
import { Loader2, Plus, RefreshCcw, ArrowUpDown, AlertCircle, Zap, Gift, Image as ImageIcon, Heart, Send, FileText, Users } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const SOLANA_RPC_URL = 'https://api.devnet.solana.com'

type BlinkType = 'payment' | 'gift' | 'nft' | 'donation' | 'transaction' | 'memo' | 'crowdfunding' | 'subscription'

interface Blink {
  id: string
  type: BlinkType
  name: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  date: string
}

interface PricingTier {
  name: string
  price: number
  features: string[]
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Basic',
    price: 9.99,
    features: ['Create up to 10 Blinks/month', 'Basic analytics', 'Email support']
  },
  {
    name: 'Pro',
    price: 19.99,
    features: ['Create unlimited Blinks', 'Advanced analytics', 'Priority support', 'Custom Blink types']
  },
  {
    name: 'Enterprise',
    price: 49.99,
    features: ['All Pro features', 'Dedicated account manager', 'API access', 'Custom integrations']
  }
]

export default function Blinkboard() {
  const router = useRouter()
  const wallet = useWallet()
  const { publicKey } = wallet
  const { toast } = useToast()
  const [blinks, setBlinks] = useState<Blink[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [balance, setBalance] = useState<number | null>(null)
  const [sortConfig, setSortConfig] = useState<{ key: keyof Blink; direction: 'asc' | 'desc' } | null>(null)
  const [showNewBlinkDialog, setShowNewBlinkDialog] = useState(false)
  const [selectedTab, setSelectedTab] = useState('all')
  const [newBlinkType, setNewBlinkType] = useState<BlinkType | ''>('')
  const [newBlinkName, setNewBlinkName] = useState('')
  const [newBlinkAmount, setNewBlinkAmount] = useState('')
  const [selectedPricingTier, setSelectedPricingTier] = useState<string | null>(null)

  useEffect(() => {
    if (publicKey) {
      fetchBalanceAndBlinks()
    }
  }, [publicKey])

  const fetchBalanceAndBlinks = async () => {
    if (!publicKey) return

    setIsLoading(true)
    try {
      const connection = new Connection(SOLANA_RPC_URL, 'confirmed')
      const [fetchedBalance, fetchedBlinks] = await Promise.all([
        fetchBalance(connection, publicKey),
        fetchBlinks(connection, publicKey)
      ])
      setBalance(fetchedBalance)
      setBlinks(fetchedBlinks)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error fetching data",
        description: "Unable to fetch your current balance and Blinks. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNewBlink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicKey || !newBlinkType) return

    setIsLoading(true)
    try {
      const connection = new Connection(SOLANA_RPC_URL, 'confirmed')
      const newBlink = await createBlink(connection, publicKey, newBlinkType, newBlinkName, parseFloat(newBlinkAmount))
      setBlinks([newBlink, ...blinks])
      toast({
        title: "Blink Created",
        description: `Your new ${newBlinkType} Blink has been created successfully.`,
      })
      setShowNewBlinkDialog(false)
      setNewBlinkType('')
      setNewBlinkName('')
      setNewBlinkAmount('')
    } catch (error) {
      console.error('Error creating Blink:', error)
      toast({
        title: "Error Creating Blink",
        description: "Unable to create a new Blink. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchBalanceAndBlinks()
  }

  const sortBlinks = (key: keyof Blink) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })

    const sortedBlinks = [...blinks].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1
      return 0
    })

    setBlinks(sortedBlinks)
  }

  const filteredBlinks = useMemo(() => {
    if (selectedTab === 'all') return blinks
    return blinks.filter(blink => blink.type === selectedTab)
  }, [blinks, selectedTab])

  const renderBlinkIcon = (type: BlinkType) => {
    switch (type) {
      case 'payment': return <Send className="h-4 w-4" />
      case 'gift': return <Gift className="h-4 w-4" />
      case 'nft': return <ImageIcon className="h-4 w-4" />
      case 'donation': return <Heart className="h-4 w-4" />
      case 'transaction': return <Zap className="h-4 w-4" />
      case 'memo': return <FileText className="h-4 w-4" />
      case 'crowdfunding': return <Users className="h-4 w-4" />
      case 'subscription': return <RefreshCcw className="h-4 w-4" />
      default: return <Zap className="h-4 w-4" />
    }
  }

  const handleUpgrade = (tierName: string) => {
    setSelectedPricingTier(tierName)
    toast({
      title: "Upgrade Initiated",
      description: `You've selected the ${tierName} plan. Please complete the payment process.`,
    })
    // Here you would typically redirect to a payment page or open a payment dialog
  }

  const chartData = useMemo(() => {
    const data: { [key: string]: number } = {}
    blinks.forEach(blink => {
      if (data[blink.type]) {
        data[blink.type] += blink.amount
      } else {
        data[blink.type] = blink.amount
      }
    })
    return Object.entries(data).map(([name, value]) => ({ name, value }))
  }, [blinks])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
          <div className="container mx-auto px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">Blinkboard</h1>

              {!publicKey && (
                <Alert className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Wallet not connected</AlertTitle>
                  <AlertDescription>
                    Please connect your wallet to view your Blinkboard.
                  </AlertDescription>
                  <WalletButton className="mt-4" />
                </Alert>
              )}

              <AnimatePresence>
                {publicKey && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Balance</CardTitle>
                          <CardDescription>Your current SOL balance</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Total Blinks</CardTitle>
                          <CardDescription>Number of Blinks created</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{blinks.length}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Active Plan</CardTitle>
                          <CardDescription>Your current subscription</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{selectedPricingTier || 'Basic'}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Actions</CardTitle>
                          <CardDescription>Quick actions for your Blinks</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button onClick={() => setShowNewBlinkDialog(true)} className="w-full mb-2">
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Blink
                          </Button>
                          <Button onClick={handleRefresh} variant="outline" className="w-full" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                            Refresh Data
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="mb-8">
                      <CardHeader>
                        <CardTitle>Blink Activity</CardTitle>
                        <CardDescription>Your recent Blink transactions and activities</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="all" onValueChange={setSelectedTab}>
                          <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="payment">Payments</TabsTrigger>
                            <TabsTrigger value="nft">NFTs</TabsTrigger>
                            <TabsTrigger value="subscription">Subscriptions</TabsTrigger>
                          </TabsList>
                          <TabsContent value="all">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Type</TableHead>
                                  <TableHead className="cursor-pointer" onClick={() => sortBlinks('name')}>
                                    Name {sortConfig?.key === 'name' && <ArrowUpDown className="h-4 w-4 inline" />}
                                  </TableHead>
                                  <TableHead className="cursor-pointer" onClick={() => sortBlinks('amount')}>
                                    Amount {sortConfig?.key === 'amount' && <ArrowUpDown className="h-4 w-4 inline" />}
                                  </TableHead>
                                  <TableHead>Currency</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead className="cursor-pointer" onClick={() => sortBlinks('date')}>
                                    Date {sortConfig?.key === 'date' && <ArrowUpDown className="h-4 w-4 inline" />}
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredBlinks.map((blink) => (
                                  <TableRow key={blink.id}>
                                    <TableCell>{renderBlinkIcon(blink.type)}</TableCell>
                                    <TableCell>{blink.name}</TableCell>
                                    <TableCell>{blink.amount}</TableCell>
                                    <TableCell>{blink.currency}</TableCell>
                                    <TableCell>
                                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                        ${blink.status === 'completed' ? 'bg-green-100 text-green-800' :
                                          blink.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                          
                                          'bg-red-100 text-red-800'}`}>
                                        {blink.status}
                                      </span>
                                    </TableCell>
                                    <TableCell>{blink.date}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>

                    <Card className="mb-8">
                      <CardHeader>
                        <CardTitle>Blink Analytics</CardTitle>
                        <CardDescription>Overview of your Blink activity by type</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Upgrade Your Plan</CardTitle>
                        <CardDescription>Choose the plan that best fits your needs</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6 md:grid-cols-3">
                          {pricingTiers.map((tier) => (
                            <Card key={tier.name}>
                              <CardHeader>
                                <CardTitle>{tier.name}</CardTitle>
                                <CardDescription>${tier.price}/month</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <ul className="list-disc list-inside space-y-2">
                                  {tier.features.map((feature, index) => (
                                    <li key={index}>{feature}</li>
                                  ))}
                                </ul>
                              </CardContent>
                              <CardFooter>
                                <Button onClick={() => handleUpgrade(tier.name)} className="w-full">
                                  Upgrade to {tier.name}
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </main>
      </div>

      <Dialog open={showNewBlinkDialog} onOpenChange={setShowNewBlinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Blink</DialogTitle>
            <DialogDescription>
              Fill in the details for your new Blink.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateNewBlink}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="blink-type" className="text-right">
                  Blink Type
                </Label>
                <Select onValueChange={(value) => setNewBlinkType(value as BlinkType)} required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a Blink type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="gift">Gift</SelectItem>
                    <SelectItem value="nft">NFT</SelectItem>
                    <SelectItem value="donation">Donation</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newBlinkName}
                  onChange={(e) => setNewBlinkName(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={newBlinkAmount}
                  onChange={(e) => setNewBlinkAmount(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowNewBlinkDialog(false)}>Cancel</Button>
              <Button type="submit">Create Blink</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}