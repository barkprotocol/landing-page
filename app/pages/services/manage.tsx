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

export function MiltonServices() {
  const { toast } = useToast()
  const [recipientAddress, setRecipientAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [blinkLabel, setBlinkLabel] = useState('')
  const [blinkDescription, setBlinkDescription] = useState('')
  const [blinkExpiration, setBlinkExpiration] = useState('')
  const [blinkMaxUses, setBlinkMaxUses] = useState('')

  const validateRecipientAddress = (address: string) => {
    try {
      new PublicKey(address); // Will throw an error if invalid
      return true;
    } catch {
      return false;
    }
  }

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
      if (!recipientAddress || !amount || !validateRecipientAddress(recipientAddress)) {
        throw new Error('Please provide a valid recipient address and amount.')
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
      if (!recipientAddress || !amount || !validateRecipientAddress(recipientAddress)) {
        throw new Error('Please provide a valid recipient address and amount for donation.')
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

  const handleSubmit = () => {
    const activeTab = document.querySelector('[role="tabpanel"][data-state="active"]')?.id;

    switch (activeTab) {
      case 'send':
        handleSendTokens()
        break;
      case 'blink':
        handleCreateBlink()
        break;
      case 'donate':
        handleMakeDonation()
        break;
      default:
        break;
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Milton Services</CardTitle>
        <CardDescription>Manage your Milton tokens and services</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="send" className="w-[300px]">
          <TabsList>
            <TabsTrigger value="send">Send</TabsTrigger>
            <TabsTrigger value="blink">Blink</TabsTrigger>
            <TabsTrigger value="donate">Donate</TabsTrigger>
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
                  value={amount} // Consider using a separate state for blink amount
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
      <CardFooter>
        <Button onClick={handleSubmit}>Submit</Button>
      </CardFooter>
    </Card>
  )
}
