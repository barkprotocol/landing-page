'use client'

import { useState } from 'react'
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SolanaConfig } from '@/lib/solana/config'
import { Send, Zap, Heart, AlertCircle } from 'lucide-react'
import { BlockchainServices } from '@/services/user-services'

export function MiltonServices() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    recipientAddress: '',
    amount: '',
    blinkLabel: '',
    blinkDescription: '',
    blinkExpiration: '',
    blinkMaxUses: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (actionType: string) => {
    try {
      const { recipientAddress, amount, blinkLabel, blinkDescription, blinkExpiration, blinkMaxUses } = formData
      const amountLamports = parseInt(amount) * 1e9 // Convert SOL to lamports

      switch (actionType) {
        case 'send':
          if (!recipientAddress || !amount) throw new Error('Please provide recipient address and amount.')
          const sendSignature = await BlockchainServices.createTransaction(SolanaConfig.payerPublicKey, recipientAddress, amountLamports, 'Milton Token Transfer')
          toast({ title: "Tokens Sent Successfully", description: `Transaction Signature: ${sendSignature}` })
          break

        case 'blink':
          if (!blinkLabel || !blinkDescription || !amount || !blinkExpiration || !blinkMaxUses) throw new Error('Please fill in all fields for creating a Blink.')
          const expirationDate = new Date(blinkExpiration)
          const blinkSignature = await BlockchainServices.createBlink(blinkLabel, blinkDescription, amountLamports, expirationDate, parseInt(blinkMaxUses))
          toast({ title: "Blink Created Successfully", description: `Transaction Signature: ${blinkSignature}` })
          break

        case 'donate':
          if (!recipientAddress || !amount) throw new Error('Please provide recipient address and amount for donation.')
          const donationSignature = await BlockchainServices.makeDonation(recipientAddress, amountLamports)
          toast({ title: "Donation Made Successfully", description: `Transaction Signature: ${donationSignature}` })
          break

        default:
          break
      }
    } catch (error) {
      toast({
        title: `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Failed`,
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
            <TabsTrigger value="send"><Send className="w-4 h-4 mr-2" /> Send</TabsTrigger>
            <TabsTrigger value="blink"><Zap className="w-4 h-4 mr-2" /> Blink</TabsTrigger>
            <TabsTrigger value="donate"><Heart className="w-4 h-4 mr-2" /> Donate</TabsTrigger>
          </TabsList>
          <TabsContent value="send">
            <ServiceForm label="Recipient Address" id="recipientAddress" value={formData.recipientAddress} onChange={handleChange} />
            <ServiceForm label="Amount (SOL)" id="amount" value={formData.amount} onChange={handleChange} />
          </TabsContent>
          <TabsContent value="blink">
            <ServiceForm label="Blink Label" id="blinkLabel" value={formData.blinkLabel} onChange={handleChange} />
            <ServiceForm label="Description" id="blinkDescription" value={formData.blinkDescription} onChange={handleChange} />
            <ServiceForm label="Amount (SOL)" id="amount" value={formData.amount} onChange={handleChange} />
            <ServiceForm label="Expiration Date" id="blinkExpiration" type="datetime-local" value={formData.blinkExpiration} onChange={handleChange} />
            <ServiceForm label="Max Uses" id="blinkMaxUses" value={formData.blinkMaxUses} onChange={handleChange} />
          </TabsContent>
          <TabsContent value="donate">
            <ServiceForm label="Donation Address" id="recipientAddress" value={formData.recipientAddress} onChange={handleChange} />
            <ServiceForm label="Amount (SOL)" id="amount" value={formData.amount} onChange={handleChange} />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between bg-gray-50">
        <Button variant="outline" className="w-full mr-2">Cancel</Button>
        <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white"
          onClick={() => {
            const activeTab = document.querySelector('[role="tabpanel"][data-state="active"]')?.id
            handleSubmit(activeTab)
          }}>
          Submit
        </Button>
      </CardFooter>
    </Card>
  )
}

function ServiceForm({ label, id, value, onChange, type = 'text' }: { label: string, id: string, value: string, onChange: React.ChangeEventHandler<HTMLInputElement>, type?: string }) {
  return (
    <div className="flex flex-col space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} placeholder={`Enter ${label}`} value={value} onChange={onChange} type={type} />
    </div>
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
        <a href={`https://explorer.solana.com/address/${SolanaConfig.miltonMintAddress}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 transition-colors">
          View on Solana Explorer
        </a>
      </CardFooter>
    </Card>
  )
}
