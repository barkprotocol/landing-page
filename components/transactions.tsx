'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, Loader2, Image as ImageIcon, Send } from 'lucide-react'
import { WalletButton } from "@/components/ui/wallet-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const SOLANA_NETWORK = 'devnet'
const SOLANA_RPC_URL = 'https://api.devnet.solana.com'

type TransactionType = 'mint' | 'transfer'

export default function BlinkNFTTokenTransaction() {
  const wallet = useWallet()
  const { publicKey, signTransaction } = wallet
  const { toast } = useToast()
  const [transactionType, setTransactionType] = useState<TransactionType>('mint')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const [formData, setFormData] = useState({
    mint: {
      name: '',
      symbol: '',
      description: '',
      image: null as File | null,
      attributes: [] as { trait_type: string; value: string }[],
    },
    transfer: {
      tokenAddress: '',
      recipient: '',
      amount: '',
    },
  })

  const updateFormData = (type: TransactionType, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicKey || !signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a Blink transaction.",
        variant: "destructive",
      })
      return
    }

    setShowConfirmDialog(true)
  }

  const confirmSubmit = async () => {
    setShowConfirmDialog(false)
    setIsSubmitting(true)

    try {
      const connection = new Connection(SOLANA_RPC_URL, 'confirmed')

      let transaction: Transaction
      let signature: string

      if (transactionType === 'mint') {
        transaction = await createMintNFTTransaction(connection, publicKey, formData.mint)
      } else {
        transaction = await createTokenTransferTransaction(connection, publicKey, formData.transfer)
      }

      const signedTransaction = await signTransaction(transaction)
      signature = await connection.sendRawTransaction(signedTransaction.serialize())

      await connection.confirmTransaction(signature, 'confirmed')

      toast({
        title: `${transactionType === 'mint' ? 'NFT Minted' : 'Tokens Transferred'}!`,
        description: (
          <div className="mt-2 flex items-center">
            <span>
              Your Blink transaction has been completed successfully.
              <a
                href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-blue-500 hover:underline"
              >
                View on Solana Explorer
              </a>
            </span>
          </div>
        ),
      })
    } catch (error) {
      console.error('Error creating Blink transaction:', error)
      toast({
        title: "Error in Blink Transaction",
        description: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const createMintNFTTransaction = async (connection: Connection, fromPubkey: PublicKey, data: typeof formData.mint) => {
    // This is a placeholder for the actual NFT minting logic
    // In a real implementation, you would interact with Metaplex or another NFT standard on Solana
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey: fromPubkey,
        lamports: LAMPORTS_PER_SOL * 0.01, // Placeholder fee
      })
    )

    return transaction
  }

  const createTokenTransferTransaction = async (connection: Connection, fromPubkey: PublicKey, data: typeof formData.transfer) => {
    const mintPublicKey = new PublicKey(data.tokenAddress)
    const destinationPublicKey = new PublicKey(data.recipient)
    const amount = parseFloat(data.amount)

    const token = new Token(
      connection,
      mintPublicKey,
      TOKEN_PROGRAM_ID,
      fromPubkey
    )

    const fromTokenAccount = await token.getOrCreateAssociatedAccountInfo(fromPubkey)
    const toTokenAccount = await token.getOrCreateAssociatedAccountInfo(destinationPublicKey)

    const transaction = new Transaction().add(
      Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        fromTokenAccount.address,
        toTokenAccount.address,
        fromPubkey,
        [],
        amount
      )
    )

    return transaction
  }

  const formIsValid = () => {
    if (transactionType === 'mint') {
      const { name, symbol, description, image } = formData.mint
      return name && symbol && description && image
    } else {
      const { tokenAddress, recipient, amount } = formData.transfer
      return tokenAddress && recipient && amount && parseFloat(amount) > 0
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Blink NFT/Token Transaction</CardTitle>
          <CardDescription>Mint NFTs or transfer tokens using Blinks on Solana</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={transactionType} onValueChange={(value) => setTransactionType(value as TransactionType)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mint">Mint NFT</TabsTrigger>
              <TabsTrigger value="transfer">Transfer Tokens</TabsTrigger>
            </TabsList>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <TabsContent value="mint">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nft-name">NFT Name</Label>
                    <Input
                      id="nft-name"
                      value={formData.mint.name}
                      onChange={(e) => updateFormData('mint', 'name', e.target.value)}
                      placeholder="Enter NFT name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nft-symbol">Symbol</Label>
                    <Input
                      id="nft-symbol"
                      value={formData.mint.symbol}
                      onChange={(e) => updateFormData('mint', 'symbol', e.target.value)}
                      placeholder="Enter NFT symbol"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nft-description">Description</Label>
                    <Textarea
                      id="nft-description"
                      value={formData.mint.description}
                      onChange={(e) => updateFormData('mint', 'description', e.target.value)}
                      placeholder="Enter NFT description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nft-image">Image</Label>
                    <Input
                      id="nft-image"
                      type="file"
                      onChange={(e) => updateFormData('mint', 'image', e.target.files?.[0] || null)}
                      accept="image/*"
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="transfer">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="token-address">Token Address</Label>
                    <Input
                      id="token-address"
                      value={formData.transfer.tokenAddress}
                      onChange={(e) => updateFormData('transfer', 'tokenAddress', e.target.value)}
                      placeholder="Enter token address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="recipient">Recipient Address</Label>
                    <Input
                      id="recipient"
                      value={formData.transfer.recipient}
                      onChange={(e) => updateFormData('transfer', 'recipient', e.target.value)}
                      placeholder="Enter recipient's wallet address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.transfer.amount}
                      onChange={(e) => updateFormData('transfer', 'amount', e.target.value)}
                      placeholder="Enter amount to transfer"
                      min="0"
                      step="any"
                    />
                  </div>
                </div>
              </TabsContent>
              <Button type="submit" className="w-full" disabled={!publicKey || !formIsValid() || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : transactionType === 'mint' ? (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Mint NFT
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Transfer Tokens
                  </>
                )}
              </Button>
            </form>
          </Tabs>
        </CardContent>
        <CardFooter>
          <div className="w-full flex justify-between items-center">
            <WalletButton />
            {!publicKey && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Wallet not connected</AlertTitle>
                <AlertDescription>
                  Please connect your wallet to perform Blink transactions.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardFooter>
      </Card>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Blink Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to proceed with this {transactionType === 'mint' ? 'NFT minting' : 'token transfer'}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Please review the details before confirming:
            </p>
            <ul className="mt-2 space-y-1">
              {Object.entries(formData[transactionType]).map(([key, value]) => (
                <li key={key} className="text-sm">
                  <span className="font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}:</span> {
                    key === 'image' ? (value as File)?.name || 'No file selected' : value.toString()
                  }
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button onClick={confirmSubmit}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}