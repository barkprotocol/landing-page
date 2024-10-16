'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Zap, Trash2, Download, Share2, Heart, QrCode } from 'lucide-react'
import { Connection, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js'
import { Metaplex, walletAdapterIdentity, bundlrStorage } from '@metaplex-foundation/js'
import { useWallet } from '@solana/wallet-adapter-react'
import QRCode from '@/components/ui/milton/qrcode'

// Assuming you have a MiltonBlinkProgram import
import { MiltonBlinkProgram } from '@/lib/milton/blink-program'

const FONTS = [
  'Arial, sans-serif',
  'Helvetica, sans-serif',
  'Georgia, serif',
  'Courier New, monospace',
  'Verdana, sans-serif',
  'Inter, sans-serif',
  'Poppins, sans-serif',
  'Syne, sans-serif',
  'Raleway, sans-serif',
  'Impact, sans-serif',
  'Times New Roman, serif',
]

const QR_CODE_TYPES = ['Donation', 'Payment', 'Affiliate', 'Airdrop', 'Reward']

interface BlinkProps {
  color: string
  duration: number
  text: string
  font: string
  backgroundColor: string
  logo?: string
  qrCode?: string
  qrCodeType: string
}

const Blink: React.FC<BlinkProps> = ({ color, duration, text, font, backgroundColor, logo, qrCode, qrCodeType }) => (
  <div 
    className="w-64 h-64 rounded-lg flex flex-col items-center justify-center relative overflow-hidden"
    style={{ backgroundColor }}
  >
    {logo && <img src={logo} alt="Logo" className="absolute top-2 left-2 w-8 h-8" />}
    {qrCode && (
      <div className="absolute top-2 right-2 w-16 h-16">
        <img src={qrCode} alt={`QR Code for ${qrCodeType}`} className="w-full h-full" />
        <span className="text-xs text-white absolute bottom-0 right-0">{qrCodeType}</span>
      </div>
    )}
    <div 
      className="w-12 h-12 rounded-full absolute"
      style={{
        backgroundColor: color,
        animation: `blink ${duration}s infinite`
      }}
    />
    <p style={{ fontFamily: font, zIndex: 10 }} className="text-white text-center p-4">{text}</p>
    <p className="text-xs text-white absolute bottom-2 right-2">Powered By Solana</p>
  </div>
)

export function SolanaBlinkGenerator() {
  const [blinks, setBlinks] = useState<BlinkProps[]>([])
  const [color, setColor] = useState('#FFA500')
  const [duration, setDuration] = useState(1)
  const [text, setText] = useState('')
  const [font, setFont] = useState(FONTS[0])
  const [backgroundColor, setBackgroundColor] = useState('#000000')
  const [logo, setLogo] = useState('')
  const [includeDonation, setIncludeDonation] = useState(false)
  const [donationAddress, setDonationAddress] = useState('')
  const [royaltyPercentage, setRoyaltyPercentage] = useState(5)
  const [qrCodeAddress, setQrCodeAddress] = useState('')
  const [qrCodeType, setQrCodeType] = useState<string>(QR_CODE_TYPES[0])
  const [qrCode, setQrCode] = useState('')
  const { toast } = useToast()
  const wallet = useWallet()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (qrCodeAddress) {
      generateQRCode()
    }
  }, [qrCodeAddress, qrCodeType])

  const generateQRCode = async () => {
    try {
      const qr = await QRCode.toDataURL(`solana:${qrCodeAddress}?label=${qrCodeType}`)
      setQrCode(qr)
    } catch (err) {
      console.error('Error generating QR code:', err)
      toast({
        title: "QR Code Generation Failed",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      })
    }
  }

  const generateBlink = useCallback(async () => {
    if (!wallet.publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to generate a Blink.",
        variant: "destructive",
      })
      return
    }

    const newBlink = { color, duration, text, font, backgroundColor, logo, qrCode, qrCodeType }
    setBlinks(prevBlinks => [...prevBlinks, newBlink])

    try {
      const connection = new Connection('https://api.mainnet-beta.solana.com')
      const metaplex = Metaplex.make(connection)
        .use(walletAdapterIdentity(wallet))
        .use(bundlrStorage())

      // Create NFT metadata
      const { uri } = await metaplex.nfts().uploadMetadata({
        name: "Milton Blink",
        description: "A custom Solana Blink NFT",
        image: logo, // You might want to generate an actual image here
        attributes: [
          { trait_type: "Color", value: color },
          { trait_type: "Duration", value: duration.toString() },
          { trait_type: "Text", value: text },
          { trait_type: "Font", value: font },
          { trait_type: "Background", value: backgroundColor },
          { trait_type: "QR Code Type", value: qrCodeType },
        ],
      })

      // Mint NFT
      const { nft } = await metaplex.nfts().create({
        uri,
        name: "Milton Blink",
        sellerFeeBasisPoints: royaltyPercentage * 100, // Convert percentage to basis points
      })

      // Create Blink using Milton Blink Program
      const blinkProgramId = new PublicKey('MILTON_BLINK_PROGRAM_ID')
      const miltonBlinkProgram = new MiltonBlinkProgram(connection, blinkProgramId)
      
      const createBlinkIx = await miltonBlinkProgram.createBlinkInstruction(
        wallet.publicKey,
        nft.address,
        color,
        duration,
        text,
        font,
        backgroundColor,
        qrCodeAddress,
        qrCodeType
      )

      const transaction = new Transaction().add(createBlinkIx)
      
      if (includeDonation) {
        const donationIx = await miltonBlinkProgram.addDonationInstruction(
          wallet.publicKey,
          new PublicKey(donationAddress),
          nft.address
        )
        transaction.add(donationIx)
      }

      const signature = await sendAndConfirmTransaction(connection, transaction, [wallet.payer])

      toast({
        title: "Blink Generated and Minted",
        description: `NFT created with address: ${nft.address.toBase58()}. Tx: ${signature}`,
      })
    } catch (error) {
      console.error('Error generating Blink:', error)
      toast({
        title: "Error Generating Blink",
        description: `An error occurred: ${error.message}`,
        variant: "destructive",
      })
    }
  }, [color, duration, text, font, backgroundColor, logo, wallet, includeDonation, donationAddress, royaltyPercentage, qrCode, qrCodeType, toast])

  const clearBlinks = () => {
    setBlinks([])
    toast({
      title: "Blinks Cleared",
      description: "All blinks have been removed.",
    })
  }

  const downloadBlinks = () => {
    const blinksData = JSON.stringify(blinks, null, 2)
    const blob = new Blob([blinksData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'solana-blinks.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({
      title: "Blinks Downloaded",
      description: "Your blinks configuration has been saved.",
    })
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogo(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const shareToSocialMedia = () => {
    // Implement social media sharing logic here
    toast({
      title: "Share to Social Media",
      description: "This feature is not yet implemented.",
    })
  }

  return (
    <section className="py-16 bg-gradient-to-br from-orange-100 to-orange-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-3xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center mb-4">Solana Blinks Generator</CardTitle>
            <CardDescription className="text-center">Create, customize, and mint Solana-style blinks as NFTs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-6">
              <div className="space-y-2">
                <Label htmlFor="color">Blink Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-grow"
                    placeholder="Enter hex color"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Blink Duration (seconds)</Label>
                <Slider
                  id="duration"
                  min={0.1}
                  max={5}
                  step={0.1}
                  value={[duration]}
                  onValueChange={(value) => setDuration(value[0])}
                />
                <div className="text-center">{duration.toFixed(1)}s</div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="text">Blink Text</Label>
                <Textarea
                  id="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text for your blink"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="font">Font</Label>
                <Select value={font} onValueChange={setFont}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a font" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONTS.map((f) => (
                      <SelectItem key={f} value={f}>{f.split(',')[0]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-grow"
                    placeholder="Enter hex color"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Logo</Label>
                <div className="flex items-center space-x-2">
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                    Upload Logo
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  {logo && <img src={logo} alt="Uploaded logo" className="w-10 h-10 object-contain" />}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="royalty">Royalty Percentage</Label>
                <Slider
                  id="royalty"
                  min={0}
                  max={10}
                  step={0.1}
                  value={[royaltyPercentage]}
                  onValueChange={(value) => setRoyaltyPercentage(value[0])}
                />
                <div className="text-center">{royaltyPercentage.toFixed(1)}%</div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="qrCodeAddress">Solana QR Code Address</Label>
                <Input
                  id="qrCodeAddress"
                  value={qrCodeAddress}
                  onChange={(e) => setQrCodeAddress(e.target.value)}
                  placeholder="Enter Solana address for QR code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qrCodeType">QR Code Type</Label>
                <Select value={qrCodeType} onValueChange={setQrCodeType}>
                  
                  <SelectTrigger>
                    <SelectValue placeholder="Select QR code type" />
                  </SelectTrigger>
                  <SelectContent>
                    {QR_CODE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="donation"
                  checked={includeDonation}
                  onCheckedChange={setIncludeDonation}
                />
                <Label htmlFor="donation">Include Donation Feature</Label>
              </div>
              {includeDonation && (
                <div className="space-y-2">
                  <Label htmlFor="donationAddress">Donation Address</Label>
                  <Input
                    id="donationAddress"
                    value={donationAddress}
                    onChange={(e) => setDonationAddress(e.target.value)}
                    placeholder="Enter Solana address for donations"
                  />
                </div>
              )}
              <div className="flex space-x-4">
                <Button onClick={generateBlink} className="w-full">
                  <Zap className="mr-2 h-4 w-4" />
                  Generate Blink (0.05 SOL + fees)
                </Button>
                <Button onClick={clearBlinks} variant="outline" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              </div>
              {blinks.length > 0 && (
                <div className="flex space-x-4">
                  <Button onClick={downloadBlinks} variant="secondary" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Blinks
                  </Button>
                  <Button onClick={shareToSocialMedia} variant="secondary" className="w-full">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share to Social Media
                  </Button>
                </div>
              )}
            </div>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              {blinks.map((blink, index) => (
                <Blink key={index} {...blink} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <style jsx global>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </section>
  )
}