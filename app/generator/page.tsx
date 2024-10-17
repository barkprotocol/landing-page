'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { Metaplex, walletAdapterIdentity, bundlrStorage } from '@metaplex-foundation/core'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Zap, Download, Share2, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import { useDebounce } from 'use-debounce'
import { WalletButton } from '@/components/ui/wallet-button'
import QRCode from 'qrcode.react'

const BASE_IMAGE_URL = 'https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg'

const currencyIcons = {
  SOL: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png',
  USDC: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
  Milton: 'https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg'
}

const fontOptions = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier',
  'Verdana',
  'Georgia',
  'Palatino',
  'Garamond',
  'Bookman',
  'Comic Sans MS',
  'Trebuchet MS',
  'Arial Black',
  'Impact'
]

const nftTypes = ['Image', 'Video', 'Audio', '3D Model']

export default function GeneratorPage() {
  const { publicKey, connected, signTransaction } = useWallet()
  const [blinkText, setBlinkText] = useState('')
  const [debouncedBlinkText] = useDebounce(blinkText, 300)
  const [fontSize, setFontSize] = useState(24)
  const [fontFamily, setFontFamily] = useState('Arial')
  const [bgColor, setBgColor] = useState('#F0E651') // Milton yellow
  const [textColor, setTextColor] = useState('#000000')
  const [isAnimated, setIsAnimated] = useState(true)
  const [generatedImageUrl, setGeneratedImageUrl] = useState('')
  const [nftName, setNftName] = useState('')
  const [nftTicker, setNftTicker] = useState('')
  const [nftType, setNftType] = useState('Image')
  const [blinkTitle, setBlinkTitle] = useState('')
  const [blinkTitlePlacement, setBlinkTitlePlacement] = useState('center')
  const [blinkDescription, setBlinkDescription] = useState('')
  const [mintSupply, setMintSupply] = useState(1)
  const [sellPrice, setSellPrice] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('SOL')
  const [royaltyPercentage, setRoyaltyPercentage] = useState(5)
  const [royaltyWallet, setRoyaltyWallet] = useState('')
  const [merchantWallet, setMerchantWallet] = useState('')
  const [serviceProviderFee, setServiceProviderFee] = useState(2.5)
  const [isLoading, setIsLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    updatePreview()
  }, [debouncedBlinkText, fontSize, fontFamily, bgColor, textColor, isAnimated, blinkTitle, blinkTitlePlacement, nftName])

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
      const drawHeight = canvas.width / aspectRatio
      ctx.drawImage(baseImage, 0, (canvas.height - drawHeight) / 2, canvas.width, drawHeight)

      // Draw Blink title
      ctx.fillStyle = textColor
      ctx.font = `bold 28px ${fontFamily}`
      ctx.textAlign = blinkTitlePlacement as CanvasTextAlign
      const titleX = blinkTitlePlacement === 'left' ? 20 : blinkTitlePlacement === 'right' ? canvas.width - 20 : canvas.width / 2
      ctx.fillText(blinkTitle || 'Untitled Blink', titleX, 40)

      // Draw text
      ctx.fillStyle = textColor
      ctx.font = `${fontSize}px ${fontFamily}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      const lines = debouncedBlinkText.split('\n')
      const lineHeight = fontSize * 1.2
      const totalTextHeight = lineHeight * lines.length
      let startY = (canvas.height - totalTextHeight) / 2

      lines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, startY + lineHeight * index)
      })

      // Draw NFT name
      ctx.fillStyle = textColor
      ctx.font = `24px ${fontFamily}`
      ctx.textAlign = 'center'
      ctx.fillText(nftName || 'Untitled NFT', canvas.width / 2, canvas.height - 40)

      // Apply animation effect if enabled
      if (isAnimated) {
        ctx.save()
        ctx.globalAlpha = 0.2
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.restore()
      }

      // Update generated image URL
      setGeneratedImageUrl(canvas.toDataURL())
    }
  }, [debouncedBlinkText, fontSize, fontFamily, bgColor, textColor, isAnimated, blinkTitle, blinkTitlePlacement, nftName])

  const handleGenerate = async () => {
    setIsLoading(true)
    if (!connected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to generate a Blink NFT.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!blinkTitle.trim() || !blinkText.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a Blink title and text.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      // Simulating API call to generate Blink NFT
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      updatePreview()

      toast({
        title: "Blink Generated!",
        description: `Your Milton Blink NFT "${blinkTitle}" has been successfully created.`,
      })
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "There was an error generating your Blink NFT. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMint = async () => {
    if (!connected || !generatedImageUrl) return
    if (!merchantWallet || !royaltyWallet) {
      toast({
        title: "Missing Wallet Information",
        description: "Please enter both merchant and royalty wallet addresses.",
        variant: "destructive",
      })
      return
    }

    try {
      // Validate wallet addresses
      new PublicKey(merchantWallet)
      new PublicKey(royaltyWallet)

      // Set up Metaplex
      const connection = new Connection(clusterApiUrl('devnet'))
      const wallet = {
        publicKey: publicKey!,
        signTransaction,
      }
      const metaplex = Metaplex.make(connection)
        .use(walletAdapterIdentity(wallet))
        .use(bundlrStorage())

      // Prepare metadata
      const { uri } = await metaplex.nfts().uploadMetadata({
        name: nftName,
        description: blinkDescription,
        image: generatedImageUrl,
        attributes: [
          { trait_type: 'Type', value: nftType },
          { trait_type: 'Background Color', value: bgColor },
          { trait_type: 'Text Color', value: textColor },
          { trait_type: 'Font', value: fontFamily },
          { trait_type: 'Animated', value: isAnimated ? 'Yes' : 'No' },
        ],
      })

      // Mint NFT
      const { nft } = await metaplex.nfts().create({
        uri,
        name: nftName,
        sellerFeeBasisPoints: royaltyPercentage * 100,
      })

      toast({
        title: "Blink Minted!",
        description: `Your Milton Blink NFT "${nftName}" has been successfully minted on the Solana blockchain. Mint address: ${nft.address.toString()}`,
      })
    } catch (error) {
      toast({
        title: "Minting Failed",
        description: "There was an error minting your Blink NFT. Please check the wallet addresses and try again.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.download = 'milton-blink.png'
    link.href = generatedImageUrl
    link.click()
  }

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(`Check out my Milton Blink NFT: ${blinkTitle}`)
    let shareUrl = ''

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`
        break
      case 'instagram':
        // Instagram doesn't have a direct share URL, so we'll just copy the link
        navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link Copied",
          description: "Share this link on Instagram",
        })
        return
    }

    window.open(shareUrl, '_blank')
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <motion.h1
        className="text-4xl font-bold text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Milton Blink Generator
      </motion.h1>

      <div className="flex justify-end mb-4">
        <WalletButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Customize Your Blink</CardTitle>
            <CardDescription>Create your unique Milton Blink NFT</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="blinkTitle">Blink Title</Label>
              <Input
                id="blinkTitle"
                value={blinkTitle}
                onChange={(e) => setBlinkTitle(e.target.value)}
                placeholder="Enter Blink title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blinkTitlePlacement">Title Placement</Label>
              <Select value={blinkTitlePlacement} onValueChange={setBlinkTitlePlacement}>
                <SelectTrigger id="blinkTitlePlacement">
                  <SelectValue placeholder="Select title placement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="blinkText">Blink Text</Label>
              <Textarea
                id="blinkText"
                placeholder="Enter your blink text here..."
                value={blinkText}
                onChange={(e) => setBlinkText(e.target.value)}
                maxLength={280}
              />
              <p className="text-sm text-gray-500">{blinkText.length}/280 characters</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="blinkDescription">Blink Description</Label>
              <Textarea
                id="blinkDescription"
                value={blinkDescription}
                onChange={(e) => setBlinkDescription(e.target.value)}
                placeholder="Enter Blink description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fontSize">Font Size</Label>
              <Slider
                
                id="fontSize"
                min={12}
                max={72}
                step={1}
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
              />
              <div className="text-sm text-gray-500">{fontSize}px</div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fontFamily">Font Family</Label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger id="fontFamily">
                  <SelectValue placeholder="Select font family" />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
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
            <div className="flex items-center space-x-2">
              <Switch
                id="animated"
                checked={isAnimated}
                onCheckedChange={setIsAnimated}
              />
              <Label htmlFor="animated">Animated Blink</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerate} className="w-full" disabled={isLoading}>
              <Zap className="mr-2 h-4 w-4" />
              {isLoading ? 'Generating...' : 'Generate Blink'}
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-8">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>See how your Blink NFT will look</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-96 flex items-center justify-center rounded-lg overflow-hidden bg-gray-200">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={800}
                  className="max-w-full max-h-full"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap justify-between gap-2">
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleDownload} disabled={!generatedImageUrl}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button onClick={handleMint} disabled={!generatedImageUrl || !connected || isLoading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {isLoading ? 'Minting...' : 'Mint NFT'}
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => handleShare('twitter')}>
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => handleShare('facebook')}>
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => handleShare('linkedin')}>
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => handleShare('instagram')}>
                  <Instagram className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>NFT Details</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nftName">NFT Name</Label>
                      <Input
                        id="nftName"
                        value={nftName}
                        onChange={(e) => setNftName(e.target.value)}
                        placeholder="Enter NFT name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nftTicker">NFT Ticker</Label>
                      <Input
                        id="nftTicker"
                        value={nftTicker}
                        onChange={(e) => setNftTicker(e.target.value)}
                        placeholder="Enter NFT ticker (e.g., BTC)"
                        maxLength={5}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="nftType">NFT Type</Label>
                    <Select value={nftType} onValueChange={setNftType}>
                      <SelectTrigger id="nftType">
                        <SelectValue placeholder="Select NFT type" />
                      </SelectTrigger>
                      <SelectContent>
                        {nftTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="mintSupply">Mint Supply</Label>
                    <Input
                      id="mintSupply"
                      type="number"
                      value={mintSupply}
                      onChange={(e) => setMintSupply(parseInt(e.target.value))}
                      min={1}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sellPrice">Sell Price</Label>
                      <Input
                        id="sellPrice"
                        value={sellPrice}
                        onChange={(e) => setSellPrice(e.target.value)}
                        placeholder="Enter sell price"
                      />
                    </div>
                    <div>
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger id="paymentMethod">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(currencyIcons).map(([currency, iconUrl]) => (
                            <SelectItem key={currency} value={currency}>
                              <div className="flex items-center">
                                <img src={iconUrl} alt={currency} className="w-5 h-5 mr-2" />
                                {currency}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="royaltyPercentage">Royalty Percentage</Label>
                    <Input
                      id="royaltyPercentage"
                      type="number"
                      value={royaltyPercentage}
                      onChange={(e) => setRoyaltyPercentage(parseFloat(e.target.value))}
                      min={0}
                      max={100}
                      step={0.1}
                    />
                  </div>
                  <div>
                    <Label htmlFor="royaltyWallet">Royalty Wallet</Label>
                    <Input
                      id="royaltyWallet"
                      value={royaltyWallet}
                      onChange={(e) => setRoyaltyWallet(e.target.value)}
                      placeholder="Enter royalty wallet address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="merchantWallet">Merchant Wallet</Label>
                    <Input
                      id="merchantWallet"
                      value={merchantWallet}
                      onChange={(e) => setMerchantWallet(e.target.value)}
                      placeholder="Enter merchant wallet address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="serviceProviderFee">Service Provider Fee (%)</Label>
                    <Input
                      id="serviceProviderFee"
                      type="number"
                      value={serviceProviderFee}
                      onChange={(e) => setServiceProviderFee(parseFloat(e.target.value))}
                      min={0}
                      max={100}
                      step={0.1}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Donate</CardTitle>
              <CardDescription>Support the Milton Blink project</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <QRCode value={publicKey ? publicKey.toBase58() : 'Connect your wallet'} size={200} />
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-sm text-gray-500">Scan to donate SOL</p>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="about" className="mt-8">
        <TabsList>
          <TabsTrigger value="about">About Blinks</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>
        <TabsContent value="about">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>About Milton Blinks</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Milton Blinks are unique, customizable NFTs on the Solana blockchain. Each Blink captures a moment of meme magic, powered by the speed and efficiency of Solana. Create, collect, and trade these digital masterpieces in the Milton ecosystem.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="faq">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>How much does it cost to mint a Blink? The generation cost is fixed at 0.05 SOL.</li>
                <li>Can I sell my Blink? Yes, you can trade your Blinks on supported Solana NFT marketplaces.</li>
                <li>Are Blinks animated? You can choose to create static or animated Blinks.</li>
                <li>What rights do I have to my Blink? You own the NFT, but please refer to our terms of service for full details on usage rights.</li>
                <li>How are royalties paid? Royalties are paid to the specified royalty wallet address for each secondary sale.</li>
                <li>What is the service provider fee? This is a fee charged by the platform for facilitating the creation and minting of Blinks.</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}