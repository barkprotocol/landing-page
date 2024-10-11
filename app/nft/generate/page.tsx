'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet, WalletContextState } from '@solana/wallet-adapter-react'
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Zap, Download, Share2, X, Twitter, Facebook, Instagram, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const BASE_IMAGE_URL = 'https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg'
const SOLANA_NETWORK = 'devnet'
const SOLANA_RPC_URL = 'https://api.devnet.solana.com'
const GENERATION_FEE = 0.05 // SOL
const ESTIMATED_TRANSACTION_FEE = 0.000005 // SOL (this is an estimate, actual fee may vary)

const FONT_OPTIONS = [
  'Arial', 'Helvetica', 'Times New Roman', 'Courier', 'Inter', 'Poppins', 'Oswald', 'Verdana', 'Syne','Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS', 'Arial Black', 'Impact'
]

export default function GeneratorPage() {
  const wallet = useWallet()
  const { publicKey, signTransaction } = wallet as WalletContextState
  const [blinkText, setBlinkText] = useState('')
  const [fontSize, setFontSize] = useState(24)
  const [fontFamily, setFontFamily] = useState('Arial')
  const [bgColor, setBgColor] = useState('#F0E651') // Milton yellow
  const [textColor, setTextColor] = useState('#000000')
  const [generatedImageUrl, setGeneratedImageUrl] = useState('')
  const [isMinting, setIsMinting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [mintedTokenAddress, setMintedTokenAddress] = useState('')
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  const updatePreview = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Load and draw base image
    const baseImage = new Image()
    baseImage.crossOrigin = 'anonymous'
    baseImage.src = BASE_IMAGE_URL
    baseImage.onload = () => {
      const aspectRatio = baseImage.width / baseImage.height
      const drawHeight = canvas.height * 0.6
      const drawWidth = drawHeight * aspectRatio
      const x = (canvas.width - drawWidth) / 2
      const y = canvas.height - drawHeight

      ctx.drawImage(baseImage, x, y, drawWidth, drawHeight)

      // Draw user text
      ctx.fillStyle = textColor
      ctx.font = `${fontSize}px ${fontFamily}`
      ctx.textAlign = 'center'
      const lines = blinkText.split('\n')
      const lineHeight = fontSize * 1.2
      const totalTextHeight = lineHeight * lines.length
      let startY = 10 // Start from the top of the canvas

      lines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, startY + lineHeight * index)
      })

      // Update generated image URL
      setGeneratedImageUrl(canvas.toDataURL())
    }
  }, [blinkText, fontSize, fontFamily, bgColor, textColor])

  useEffect(() => {
    updatePreview()
  }, [updatePreview])

  const handleGenerate = async () => {
    if (!wallet.connected || !publicKey || !signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to generate a Blink NFT.",
        variant: "destructive",
      })
      return
    }

    if (!blinkText.trim()) {
      toast({
        title: "Empty Blink",
        description: "Please enter some text for your Blink NFT.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const connection = new Connection(SOLANA_RPC_URL, 'confirmed')
      const balance = await connection.getBalance(publicKey)
      const totalFee = GENERATION_FEE + ESTIMATED_TRANSACTION_FEE
      
      if (balance < totalFee * LAMPORTS_PER_SOL) {
        toast({
          title: "Insufficient balance",
          description: `You need at least ${totalFee.toFixed(6)} SOL to generate a Blink.`,
          variant: "destructive",
        })
        return
      }

      // Create a transaction to transfer the generation fee
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey('YourFeeReceiverAddressHere'), // Replace with your fee receiver address
          lamports: GENERATION_FEE * LAMPORTS_PER_SOL
        })
      )

      // Get the latest blockhash
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      // Sign and send the transaction
      const signedTransaction = await signTransaction(transaction)
      const signature = await connection.sendRawTransaction(signedTransaction.serialize())
      await connection.confirmTransaction(signature, 'confirmed')

      updatePreview()

      toast({
        title: "Blink Generated!",
        description: `Your Milton Blink NFT has been successfully created for ${totalFee.toFixed(6)} SOL (including transaction fee).`,
      })
    } catch (error) {
      console.error('Generation error:', error)
      toast({
        title: "Generation Failed",
        description: "There was an error generating your Blink NFT. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleMint = async () => {
    if (!wallet.connected || !generatedImageUrl || !publicKey || !signTransaction) return

    setIsMinting(true)

    try {
      const connection = new Connection(SOLANA_RPC_URL, 'confirmed')

      // Create a new mint
      const mint = await createMint(
        connection,
        {
          publicKey,
          signTransaction
        },
        publicKey,
        publicKey,
        0
      )

      // Get the token account of the wallet address, and if it does not exist, create it
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        {
          publicKey,
          signTransaction
        },
        mint,
        publicKey
      )

      // Mint 1 new token to the "tokenAccount" account we just created
      await mintTo(
        connection,
        {
          publicKey,
          signTransaction
        },
        mint,
        tokenAccount.address,
        publicKey,
        1
      )

      setMintedTokenAddress(mint.toBase58())

      toast({
        title: "Blink Minted!",
        description: `Your Milton Blink NFT has been successfully minted on the Solana ${SOLANA_NETWORK}.`,
      })
    } catch (error) {
      console.error('Minting error:', error)
      toast({
        title: "Minting Failed",
        description: "There was an error minting your Blink NFT. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsMinting(false)
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.download = 'milton-blink.png'
    link.href = generatedImageUrl
    link.click()
  }

  const handleShare = (platform: 'twitter' | 'facebook' | 'instagram') => {
    const text = `Check out my Milton Blink NFT! ${mintedTokenAddress ? `Token: ${mintedTokenAddress}` : ''}`
    const url = 'https://miltonprotocol.com/blink/' + (mintedTokenAddress || 'preview')

    let shareUrl = ''
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'instagram':
        // Instagram doesn't have a direct share URL, so we'll just copy the text to clipboard
        navigator.clipboard.writeText(`${text} ${url}`)
        toast({
          title: "Copied to Clipboard",
          description: "Share the copied text on Instagram!",
        })
        return
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1 
        className="text-4xl font-bold text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Milton Blink Generator
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Customize Your Blink</CardTitle>
            <CardDescription>
              Create your unique Milton Blink NFT for {GENERATION_FEE} SOL + {ESTIMATED_TRANSACTION_FEE} SOL (est. transaction fee)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="blinkText">Blink Text</Label>
              <Textarea 
                id="blinkText"
                placeholder="Enter your blink text here..."
                value={blinkText}
                onChange={(e) => setBlinkText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fontSize">Font Size: {fontSize}px</Label>
              <Slider
                id="fontSize"
                min={12}
                max={72}
                step={1}
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fontFamily">Font Family</Label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a font" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font} value={font}>{font}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bgColor">Background Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="bgColor"
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-12 h-12 p-1 rounded-md"
                />
                <Input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-grow"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="textColor">Text Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="textColor"
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-12 h-12 p-1 rounded-md"
                />
                <Input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-grow"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerate} className="w-full" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Generate Blink ({(GENERATION_FEE + ESTIMATED_TRANSACTION_FEE).toFixed(6)} SOL)
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>See how your Blink NFT will look</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-64 flex items-center justify-center rounded-lg overflow-hidden bg-gray-100">
              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="max-w-full  max-h-full"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleDownload} disabled={!generatedImageUrl}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={!generatedImageUrl}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share Your Blink</DialogTitle>
                  <DialogDescription>
                    Choose a platform to share your Milton Blink NFT
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center space-x-4 mt-4">
                  <Button onClick={() => handleShare('twitter')}>
                    <Twitter className="mr-2 h-4 w-4" />
                    Twitter
                  </Button>
                  <Button onClick={() => handleShare('facebook')}>
                    <Facebook className="mr-2 h-4 w-4" />
                    Facebook
                  </Button>
                  <Button onClick={() => handleShare('instagram')}>
                    <Instagram className="mr-2 h-4 w-4" />
                    Instagram
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={handleMint} disabled={!generatedImageUrl || !wallet.connected || isMinting}>
              {isMinting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Minting...
                </>
              ) : (
                'Mint NFT'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="about" className="mt-8">
        <TabsList>
          <TabsTrigger value="about">About Blinks</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About Milton Blinks</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Milton Blinks are unique, customizable NFTs on the Solana blockchain. Each Blink captures a moment of meme magic, powered by the speed and efficiency of Solana. Create, collect, and trade these digital masterpieces in the Milton ecosystem.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>How much does it cost to generate a Blink? <br />Generating a Blink costs {GENERATION_FEE} SOL plus an estimated {ESTIMATED_TRANSACTION_FEE} SOL transaction fee.</li>
                <li>How much does it cost to mint a Blink? <br />Minting fees are paid in SOL and vary based on network conditions.</li>
                <li>Can I sell my Blink?<br />Yes, you can trade your Blinks on supported Solana NFT marketplaces.</li>
                <li>Are Blinks animated?<br />Blinks are static images with customizable text and colors.</li>
                <li>What rights do I have to my Blink?<br />You own the NFT, but please refer to our terms of service for full details on usage rights.</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {!wallet.connected && (
        <Alert className="mt-8">
          <AlertTitle>Wallet not connected</AlertTitle>
          <AlertDescription>
            Please connect your Solana wallet to generate and mint Blinks.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}