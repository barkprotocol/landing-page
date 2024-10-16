'use client'

import { useState, useEffect } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { MarketPrices } from './market-prices'
import { TokenBalances } from '../dashboard/token-balances'
import { PriceHistory } from './price-history'
import { SolanaBlinks } from './solana-blinks'
import { SocialMedia } from './social-media'
import { BlinkboardTabs } from './blinkboard-tabs'
import { TransactionHistory } from './transaction-history'
import { NFTGallery } from './nft-gallery'
import { GenerateSection } from './generate-section'
import { ScheduleTransactionModal } from './schedule-transaction-modal'
import { RecurringPaymentModal } from './recurring-payment-modal'
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface BlinkboardProps {
  isDarkMode: boolean
}

export default function Component({ isDarkMode }: BlinkboardProps) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [marketPrices, setMarketPrices] = useState<Record<string, number>>({})
  const [tokenBalances, setTokenBalances] = useState<Record<string, number>>({})
  const [priceHistory, setPriceHistory] = useState<Array<{ date: string; SOL: number; USDC: number; MILTON: number }>>([])
  const [blinks, setBlinks] = useState<Array<any>>([])
  const [socialMedia, setSocialMedia] = useState<Array<any>>([])
  const [transactionHistory, setTransactionHistory] = useState<Array<any>>([])
  const [nftGallery, setNftGallery] = useState<Array<any>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([
          fetchMarketPrices(),
          fetchTokenBalances(),
          fetchPriceHistory(),
          fetchBlinks(),
          fetchSocialMedia()
        ])
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to fetch data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [wallet.publicKey])

  useEffect(() => {
    if (wallet.connected) {
      fetchTransactionHistory()
      fetchNFTGallery()
    }
  }, [wallet.connected])

  const fetchMarketPrices = async () => {
    const response = await fetch('/api/v1/blinkboard/market-prices')
    const data = await response.json()
    setMarketPrices(data)
  }

  const fetchTokenBalances = async () => {
    if (!wallet.publicKey) return
    const response = await fetch(`/api/v1/blinkboard/token-balances?wallet=${wallet.publicKey.toBase58()}`)
    const data = await response.json()
    setTokenBalances(data)
  }

  const fetchPriceHistory = async () => {
    const response = await fetch('/api/v1/blinkboard/price-history')
    const data = await response.json()
    setPriceHistory(data)
  }

  const fetchBlinks = async () => {
    const response = await fetch('/api/v1/blinkboard/blinks')
    const data = await response.json()
    setBlinks(data)
  }

  const fetchSocialMedia = async () => {
    const response = await fetch('/api/v1/blinkboard/social-media')
    const data = await response.json()
    setSocialMedia(data)
  }

  const fetchTransactionHistory = async () => {
    if (!wallet.publicKey) return
    const response = await fetch(`/api/v1/blinkboard/transaction-history?wallet=${wallet.publicKey.toBase58()}`)
    const data = await response.json()
    setTransactionHistory(data)
  }

  const fetchNFTGallery = async () => {
    if (!wallet.publicKey) return
    const response = await fetch(`/api/v1/blinkboard/nft-gallery?wallet=${wallet.publicKey.toBase58()}`)
    const data = await response.json()
    setNftGallery(data)
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className={`shadow-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
          <CardHeader>
            <CardTitle>Market Prices</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="w-full h-[200px]" />
            ) : (
              <MarketPrices prices={marketPrices} isDarkMode={isDarkMode} />
            )}
          </CardContent>
        </Card>
        <Card className={`shadow-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
          <CardHeader>
            <CardTitle>Your Balances</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="w-full h-[200px]" />
            ) : (
              <TokenBalances balances={tokenBalances} isDarkMode={isDarkMode} />
            )}
          </CardContent>
        </Card>
        <Card className={`shadow-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
          <CardHeader>
            <CardTitle>Price History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="w-full h-[200px]" />
            ) : (
              <PriceHistory history={priceHistory} isDarkMode={isDarkMode} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={`shadow-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
          <CardHeader>
            <CardTitle>Solana Blinks</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="w-full h-[200px]" />
            ) : (
              <SolanaBlinks blinks={blinks} isDarkMode={isDarkMode} />
            )}
          </CardContent>
        </Card>
        <Card className={`shadow-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="w-full h-[200px]" />
            ) : (
              <SocialMedia socialMedia={socialMedia} isDarkMode={isDarkMode} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card className={`shadow-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
        <CardContent>
          <BlinkboardTabs
            isDarkMode={isDarkMode}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            wallet={wallet}
            fetchTokenBalances={fetchTokenBalances}
            fetchTransactionHistory={fetchTransactionHistory}
            fetchNFTGallery={fetchNFTGallery}
          />
        </CardContent>
      </Card>

      <Card className={`shadow-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
        <CardHeader>
          <CardTitle>Generate</CardTitle>
        </CardHeader>
        <CardContent>
          <GenerateSection isDarkMode={isDarkMode} />
        </CardContent>
      </Card>

      <Card className={`shadow-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionHistory transactions={transactionHistory} isDarkMode={isDarkMode} />
        </CardContent>
      </Card>

      <Card className={`shadow-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
        <CardHeader>
          <CardTitle>NFT Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <NFTGallery nfts={nftGallery} isDarkMode={isDarkMode} />
        </CardContent>
      </Card>

      <ScheduleTransactionModal isDarkMode={isDarkMode} />
      <RecurringPaymentModal isDarkMode={isDarkMode} />
    </div>
  )
}