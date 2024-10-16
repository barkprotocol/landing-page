'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Shuffle, Gift, Plus, CreditCard, ImageIcon, Heart } from 'lucide-react'
import { SendForm } from './send-form'
import { SwapForm } from './swap-form'
import { GiftForm } from './gift-form'
import { CreateForm } from './create-form'
import { PaymentsForm } from './payments-form'
import { CreateNFTForm } from './create-nft-form'
import { DonateForm } from './donate-form'

interface BlinkboardTabsProps {
  isDarkMode: boolean
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  wallet: any
  fetchTokenBalances: () => Promise<void>
  fetchTransactionHistory: () => Promise<void>
  fetchNFTGallery: () => Promise<void>
}

export function BlinkboardTabs({
  isDarkMode,
  isLoading,
  setIsLoading,
  wallet,
  fetchTokenBalances,
  fetchTransactionHistory,
  fetchNFTGallery
}: BlinkboardTabsProps) {
  const [activeTab, setActiveTab] = useState('send')

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-7 mb-8" aria-label="Blinkboard actions">
        <TabsTrigger value="send" aria-label="Send tokens">
          <Send className="mr-2 h-4 w-4" aria-hidden="true" />
          Send
        </TabsTrigger>
        <TabsTrigger value="swap" aria-label="Swap tokens">
          <Shuffle className="mr-2 h-4 w-4" aria-hidden="true" />
          Swap
        </TabsTrigger>
        <TabsTrigger value="gift" aria-label="Gift tokens">
          <Gift className="mr-2 h-4 w-4" aria-hidden="true" />
          Gift
        </TabsTrigger>
        <TabsTrigger value="create" aria-label="Create new token">
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Create
        </TabsTrigger>
        <TabsTrigger value="payments" aria-label="Manage payments">
          <CreditCard className="mr-2 h-4 w-4" aria-hidden="true" />
          Payments
        </TabsTrigger>
        <TabsTrigger value="nft" aria-label="Create NFT">
          <ImageIcon className="mr-2 h-4 w-4" aria-hidden="true" />
          NFT
        </TabsTrigger>
        <TabsTrigger value="donations" aria-label="Make donations">
          <Heart className="mr-2 h-4 w-4" aria-hidden="true" />
          Donations
        </TabsTrigger>
      </TabsList>
      <TabsContent value="send">
        <SendForm
          isDarkMode={isDarkMode}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          wallet={wallet}
          fetchTokenBalances={fetchTokenBalances}
          fetchTransactionHistory={fetchTransactionHistory}
        />
      </TabsContent>
      <TabsContent value="swap">
        <SwapForm
          isDarkMode={isDarkMode}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          wallet={wallet}
          fetchTokenBalances={fetchTokenBalances}
          fetchTransactionHistory={fetchTransactionHistory}
        />
      </TabsContent>
      <TabsContent value="gift">
        <GiftForm
          isDarkMode={isDarkMode}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          wallet={wallet}
          fetchTokenBalances={fetchTokenBalances}
          fetchTransactionHistory={fetchTransactionHistory}
        />
      </TabsContent>
      <TabsContent value="create">
        <CreateForm
          isDarkMode={isDarkMode}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          wallet={wallet}
          fetchTokenBalances={fetchTokenBalances}
          fetchTransactionHistory={fetchTransactionHistory}
        />
      </TabsContent>
      <TabsContent value="payments">
        <PaymentsForm
          isDarkMode={isDarkMode}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          wallet={wallet}
          fetchTokenBalances={fetchTokenBalances}
          fetchTransactionHistory={fetchTransactionHistory}
        />
      </TabsContent>
      <TabsContent value="nft">
        <CreateNFTForm
          isDarkMode={isDarkMode}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          wallet={wallet}
          fetchNFTGallery={fetchNFTGallery}
        />
      </TabsContent>
      <TabsContent value="donations">
        <DonateForm
          isDarkMode={isDarkMode}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          wallet={wallet}
          fetchTokenBalances={fetchTokenBalances}
          fetchTransactionHistory={fetchTransactionHistory}
        />
      </TabsContent>
    </Tabs>
  )
}