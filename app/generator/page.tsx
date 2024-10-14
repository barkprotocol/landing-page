'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Zap, Download, Share2 } from 'lucide-react'

const BASE_IMAGE_URL = 'https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg'

export default function GeneratorPage() {
  const { publicKey, connected } = useWallet()
  const [blinkText, setBlinkText] = useState('')
  const [fontSize, setFontSize] = useState(24)
  const [bgColor, setBgColor] = useState('#F0E651') // Milton yellow
  const [textColor, setTextColor] = useState('#000000')
  const [isAnimated, setIsAnimated] = useState(true)
  const [generatedImageUrl, setGeneratedImageUrl] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    updatePreview()
  }, [blinkText, fontSize, bgColor, textColor, isAnimated])

  const updatePreview = () => {
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

      // Draw text
      ctx.fillStyle = textColor
      ctx.font = `${fontSize}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      const lines = blinkText.split('\n')
      const lineHeight = fontSize * 1.2
      const totalTextHeight = lineHeight * lines.length
      let startY = (canvas.height - totalTextHeight) / 2

      lines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, startY + lineHeight * index)
      })

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
  }

  const handleGenerate = async () => {
    if (!connected) {
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

    try {
      // Simulating API call to generate Blink NFT
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      updatePreview()

      toast({
        title: "Blink Generated!",
        description: "Your Milton Blink NFT has been successfully created.",
      })
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "There was an error generating your Blink NFT. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleMint = async () => {
    if (!connected || !generatedImageUrl) return

    try {
      // Simulating minting process
      await new Promise(resolve => setTimeout(resolve, 3000))

      toast({
        title: "Blink Minted!",
        description: "Your Milton Blink NFT has been successfully minted on the Solana blockchain.",
      })
    } catch (error) {
      toast({
        title: "Minting Failed",
        description: "There was an error minting your Blink NFT. Please try again.",
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
            <CardDescription>Create your unique Milton Blink NFT</CardDescription>
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
            <Button onClick={handleGenerate} className="w-full">
              <Zap className="mr-2 h-4 w-4" />
              Generate Blink
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>See how your Blink NFT will look</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-64 flex items-center justify-center rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="max-w-full max-h-full"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleDownload} disabled={!generatedImageUrl}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" disabled={!generatedImageUrl}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button onClick={handleMint} disabled={!generatedImageUrl || !connected}>
              Mint NFT
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
                <li>How much does it cost to mint a Blink? Minting fees are paid in SOL and vary based on network conditions.</li>
                <li>Can I sell my Blink? Yes, you can trade your Blinks on supported Solana NFT marketplaces.</li>
                <li>Are Blinks animated? You can choose to create static or animated Blinks.</li>
                <li>What rights do I have to my Blink? You own the NFT, but please refer to our terms of service for full details on usage rights.</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}