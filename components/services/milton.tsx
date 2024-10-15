'use client'

import { useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BlockchainServices } from '@/lib/solana/blockchain-services'
import { SolanaConfig } from '@/lib/config'
import { Send, Zap, Heart, AlertCircle } from 'lucide-react'

export function MiltonServices() {
  const { toast } = useToast()
  const [recipientAddress, setRecipientAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [blinkLabel, setBlinkLabel] = useState('')
  const [blinkDescription, setBlinkDescription] = useState('')
  const [blinkExpiration, setBlinkExpiration] = useState('')
  const [blinkMaxUses, setBlinkMaxUses] = useState('')

  const handleCreateBlink = async () => {
    try {
      if (!blinkLabel || !blinkDescription || !amount || !blinkExpiration || !blinkMaxUses) {
        throw new Error('Please fill in all fields for creating a Blink.')
      }

      const amountLamports = parseInt(amount) * 1e9 // Convert SOL to lamports
      const expirationDate = new Date(blinkExpiration)
      const maxUses = parseInt(blinkMaxUses)

      const signature = await BlockchainServices.createBlink(
        blinkLabel,
        blinkDescription,
        amountLamports,
        expirationDate,
        maxUses
      )

      toast({
        title: "Blink Created Successfully",
        description: `Transaction Signature: ${signature}`,
      })
    } catch (error) {
      toast({
        title: "Blink Creation Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const handleSendTokens = async () => {
    try {
      if (!recipientAddress || !amount) {
        throw new Error('Please provide a recipient address and amount.')
      }

      const amountLamports = parseInt(amount) * 1e9 // Convert SOL to lamports

      const signature = await BlockchainServices.createTransaction(
        SolanaConfig.payerPublicKey,
        recipientAddress,
        amountLamports,
        'Milton Token Transfer'
      )

      toast({
        title: "Tokens Sent Successfully",
        description: `Transaction Signature: ${signature}`,
      })
    } catch (error) {
      toast({
        title: "Token Transfer Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  const handleMakeDonation = async () => {
    try {
      if (!recipientAddress || !amount) {
        throw new Error('Please provide a recipient address and amount for donation.')
      }

      const amountLamports = parseInt(amount) * 1e9 // Convert SOL to lamports

      const signature = await BlockchainServices.makeDonation(
        recipientAddress,
        amountLamports
      )

      toast({
        title: "Donation Made Successfully",
        description: `Transaction Signature: ${signature}`,
      })
    } catch (error) {
      toast({
        title: "Donation Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-[400px] shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardTitle className="text-2xl font-bold flex items-center">
          <img src="/milton-logo.png" alt="Milton Logo" className="w-8 h-8 mr-2" />
          Milton Services
        </CardTitle>
        <CardDescription className="text-gray-200">Manage your Milton tokens and services</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="send" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="send" className="flex items-center justify-center">
              <Send className="w-4 h-4 mr-2" />
              Send
            </TabsTrigger>
            <TabsTrigger value="blink" className="flex items-center justify-center">
              <Zap className="w-4 h-4 mr-2" />
              Blink
            </TabsTrigger>
            <TabsTrigger value="donate" className="flex items-center justify-center">
              <Heart className="w-4 h-4 mr-2" />
              Donate
            </TabsTrigger>
          </TabsList>
          <TabsContent value="send">
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="recipientAddress">Recipient Address</Label>
                <Input
                  id="recipientAddress"
                  placeholder="Enter Solana address"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="amount">Amount (SOL)</Label>
                <Input
                  id="amount"
                  placeholder="Enter amount in SOL"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="blink">
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="blinkLabel">Blink Label</Label>
                <Input
                  id="blinkLabel"
                  placeholder="Enter Blink label"
                  value={blinkLabel}
                  onChange={(e) => setBlinkLabel(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="blinkDescription">Description</Label>
                <Input
                  id="blinkDescription"
                  placeholder="Enter Blink description"
                  value={blinkDescription}
                  onChange={(e) => setBlinkDescription(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="blinkAmount">Amount (SOL)</Label>
                <Input
                  id="blinkAmount"
                  placeholder="Enter amount in SOL"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="blinkExpiration">Expiration Date</Label>
                <Input
                  id="blinkExpiration"
                  type="datetime-local"
                  value={blinkExpiration}
                  onChange={(e) => setBlinkExpiration(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="blinkMaxUses">Max Uses</Label>
                <Input
                  id="blinkMaxUses"
                  placeholder="Enter max uses"
                  value={blinkMaxUses}
                  onChange={(e) => setBlinkMaxUses(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="donate">
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="donationAddress">Donation Address</Label>
                <Input
                  id="donationAddress"
                  placeholder="Enter Solana address"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="donationAmount">Amount (SOL)</Label>
                <Input
                  id="donationAmount"
                  placeholder="Enter amount in SOL"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between bg-gray-50">
        <Button variant="outline" className="w-full mr-2">Cancel</Button>
        <Button 
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          onClick={() => {
            if (document.querySelector('[role="tabpanel"][data-state="active"]')?.id === 'send') {
              handleSendTokens()
            } else if (document.querySelector('[role="tabpanel"][data-state="active"]')?.id === 'blink') {
              handleCreateBlink()
            } else if (document.querySelector('[role="tabpanel"][data-state="active"]')?.id === 'donate') {
              handleMakeDonation()
            }
          }}
        >
          Submit
        </Button>
      </CardFooter>
    </Card>
  )
}

export function MiltonInfo() {
  return (
    <Card className="w-[400px] mt-6 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
        <CardTitle className="text-xl font-bold flex items-center">
          <AlertCircle className="w-6 h-6 mr-2" />
          Milton Token Info
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-sm font-semibold">Name:</div>
          <div>Milton Token</div>
          <div className="text-sm font-semibold">Symbol:</div>
          <div>MLT</div>
          <div className="text-sm font-semibold">Total Supply:</div>
          <div>1,000,000,000 MLT</div>
          <div className="text-sm font-semibold">Decimals:</div>
          <div>9</div>
          <div className="text-sm font-semibold">Contract Address:</div>
          <div className="truncate">{SolanaConfig.miltonMintAddress}</div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 flex justify-center">
        <a 
          href={`https://explorer.solana.com/address/${SolanaConfig.miltonMintAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 transition-colors"
        >
          View on Solana Explorer
        </a>
      </CardFooter>
    </Card>
  )
}