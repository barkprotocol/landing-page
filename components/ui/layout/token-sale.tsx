'use client'

import { useState, useEffect } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Transaction } from '@solana/web3.js'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Define the type for a sale phase
interface SalePhase {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  price: number;
  minPurchase: number;
  maxPurchase: number;
  totalSupply: number;
  status: 'active' | 'upcoming' | 'ended';
}

// Define the sale phases with the correct type
const salePhases: SalePhase[] = [
  {
    name: 'Pre-Sale',
    description: 'Early access for whitelisted addresses',
    startDate: '2025-07-01T00:00:00Z',
    endDate: '2025-07-07T23:59:59Z',
    price: 0.00001,
    minPurchase: 1000,
    maxPurchase: 100000,
    totalSupply: 1000000000,
    status: 'active',
  },
  {
    name: 'Public Sale',
    description: 'Open to all participants',
    startDate: '2025-07-08T00:00:00Z',
    endDate: '2025-07-15T23:59:59Z',
    price: 0.000015,
    minPurchase: 100,
    maxPurchase: 1000000,
    totalSupply: 5000000000,
    status: 'upcoming',
  },
  {
    name: 'Final Sale',
    description: 'Last chance to participate',
    startDate: '2025-07-16T00:00:00Z',
    endDate: '2025-07-23T23:59:59Z',
    price: 0.00002,
    minPurchase: 10,
    maxPurchase: 10000000,
    totalSupply: 12067600000,
    status: 'upcoming',
  },
]

export default function TokenSales() {
  const [activePhase, setActivePhase] = useState<string>('pre-sale')
  const [amount, setAmount] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [saleProgress, setSaleProgress] = useState<number>(0)
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const { toast } = useToast()

  useEffect(() => {
    const fetchSaleData = async () => {
      try {
        // Replace this with actual API call to fetch sale progress
        const response = await fetch('/api/sale-progress')
        const data = await response.json()
        setSaleProgress(data.progress)
      } catch (error) {
        console.error('Error fetching sale progress:', error)
      }
    }

    const interval = setInterval(fetchSaleData, 30000)
    fetchSaleData()

    return () => clearInterval(interval)
  }, [])

  const handleTransaction = async (phase: SalePhase) => {
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to participate in the sale.",
        variant: "destructive",
      })
      return
    }

    if (!amount || isNaN(parseFloat(amount))) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid token amount.",
        variant: "destructive",
      })
      return
    }

    const tokenAmount = parseFloat(amount)
    if (tokenAmount < phase.minPurchase || tokenAmount > phase.maxPurchase) {
      toast({
        title: "Invalid purchase amount",
        description: `Please enter an amount between ${phase.minPurchase} and ${phase.maxPurchase} tokens.`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const transaction = new Transaction()
      // Add your transaction logic here
      // This is a placeholder and should be replaced with actual Solana program interaction
      // transaction.add(...)

      const signature = await sendTransaction(transaction, connection)
      
      toast({
        title: "Transaction submitted",
        description: (
          <div className="flex items-center">
            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
            <span>
              Your transaction has been submitted.{' '}
              <a
                href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                View on Solana Explorer
              </a>
            </span>
          </div>
        ),
      })
    } catch (error) {
      console.error('Transaction failed:', error)
      toast({
        title: "Transaction failed",
        description: (error as Error).message || "An error occurred while processing your transaction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-12 sm:py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">MILTON Token Sale</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Participate in our token sale and be part of the MILTON ecosystem
          </p>
        </motion.div>

        <div className="flex justify-center mb-8">
          <WalletMultiButton className="bg-primary hover:bg-primary/90 text-primary-foreground" />
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Sale Progress</CardTitle>
            <CardDescription>Overall token sale progress across all phases</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={saleProgress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">{saleProgress}% of tokens sold</p>
          </CardContent>
        </Card>

        <Tabs value={activePhase} onValueChange={setActivePhase} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 gap-4">
            {salePhases.map((phase) => (
              <TabsTrigger
                key={phase.name}
                value={phase.name.toLowerCase().replace(' ', '-')}
                className="w-full"
              >
                {phase.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {salePhases.map((phase) => (
            <TabsContent key={phase.name} value={phase.name.toLowerCase().replace(' ', '-')}>
              <Card>
                <CardHeader>
                  <CardTitle>{phase.name}</CardTitle>
                  <CardDescription>{phase.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <p>{new Date(phase.startDate).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <p>{new Date(phase.endDate).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label>Price</Label>
                      <p>{phase.price} USDC</p>
                    </div>
                    <div>
                      <Label>Total Supply</Label>
                      <p>{phase.totalSupply.toLocaleString()} MILTON</p>
                    </div>
                    <div>
                      <Label>Min Purchase</Label>
                      <p>{phase.minPurchase.toLocaleString()} MILTON</p>
                    </div>
                    <div>
                      <Label>Max Purchase</Label>
                      <p>{phase.maxPurchase.toLocaleString()} MILTON</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount to Purchase</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter MILTON amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min={phase.minPurchase}
                      max={phase.maxPurchase}
                    />
                  </div>
                  {amount && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Purchase Summary</AlertTitle>
                      <AlertDescription>
                        You will receive {parseFloat(amount).toLocaleString()} MILTON tokens for {(parseFloat(amount) * phase.price).toFixed(2)} USDC
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={phase.status !== 'active' || isLoading || !publicKey}
                    onClick={() => handleTransaction(phase)}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : phase.status === 'active' ? (
                      'Participate in Sale'
                    ) : (
                      'Coming Soon'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}