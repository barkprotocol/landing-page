'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, Zap, Coins, BarChart2, Image as ImageIcon, Info, RefreshCcw, Gift, CreditCard, Repeat, FileText, Heart, Shuffle, Vote, Printer, Lock, Wand2, Eye, Check, DollarSign, Bell, Shield, MessageSquare, Trash, Download, Users, Code, ChevronRight } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const BlinkboardDemo = () => {
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [blinkName, setBlinkName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('SOL')
  const [transactionSpeed, setTransactionSpeed] = useState(90)
  const [newFeatures, setNewFeatures] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Creating blink:', { blinkName, amount, recipient, paymentMethod, transactionSpeed, newFeatures })
    // Reset form
    setAmount('')
    setRecipient('')
    setBlinkName('')
    setPaymentMethod('SOL')
    setTransactionSpeed(90)
    setNewFeatures(false)
  }

  const calculateFee = () => {
    const baseFee = 0.05
    const speedMultiplier = transactionSpeed / 100
    return (baseFee + (speedMultiplier * 0.01)).toFixed(3)
  }

  const tokenIcons = {
    SOL: "https://cryptologos.cc/logos/solana-sol-logo.png?v=024",
    MILTON: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=024",
    USDC: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=024"
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create a Blink</CardTitle>
          <CardDescription>Send funds instantly on the Solana network</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="blinkName">Blink Name</Label>
              <Input
                id="blinkName"
                value={blinkName}
                onChange={(e) => setBlinkName(e.target.value)}
                placeholder="My Awesome Blink"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tokenIcons).map(([token, iconUrl]) => (
                    <SelectItem key={token} value={token}>
                      <div className="flex items-center">
                        <img src={iconUrl} alt={token} className="w-5 h-5 mr-2" />
                        {token}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                type="text"
                placeholder="Solana address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Transaction Speed</Label>
              <Slider
                min={0}
                max={100}
                step={10}
                value={[transactionSpeed]}
                onValueChange={(value) => setTransactionSpeed(value[0])}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Slow</span>
                <span>Fast</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="new-features"
                checked={newFeatures}
                onCheckedChange={setNewFeatures}
              />
              <Label htmlFor="new-features">Enable new features</Label>
            </div>
            <div className="text-sm text-muted-foreground">
              Creation fee: {calculateFee()} SOL + Solana transaction fee
            </div>
            <Button type="submit" className="w-full">
              Send Blink <Zap className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Transaction Info</CardTitle>
          <CardDescription>Real-time updates and transaction details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Transaction Speed</span>
            <span className="text-sm font-medium text-yellow-600">Ultra Fast</span>
          </div>
          <Progress value={transactionSpeed} className="w-full" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Network Fee</Label>
              <p className="text-lg font-semibold">{calculateFee()} SOL</p>
            </div>
            <div>
              <Label className="text-sm">Estimated Time</Label>
              <p className="text-lg font-semibold">{Math.max(1, Math.round(10 - (transactionSpeed / 10)))} seconds</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Transaction Security</Label>
            <div className="flex items-center space-x-2">
              <Lock className="text-yellow-500" />
              <span className="text-sm text-yellow-500">Secure</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your transaction is protected by Solana's advanced encryption and consensus mechanism.
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Network Status</Label>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Operational</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Solana Network</Label>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">Mainnet</Badge>
              <Badge variant="success">Online</Badge>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Transaction Monitoring</Label>
            <div className="flex items-center space-x-2">
              <Bell className="text-yellow-500" />
              <span className="text-sm">Real-time alerts enabled</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Fraud Protection</Label>
            <div className="flex items-center space-x-2">
              <Shield className="text-orange-500" />
              <span className="text-sm">Active</span>
            </div>
          </div>
          {newFeatures && (
            <div className="space-y-2">
              <Label className="text-sm">New Features</Label>
              <div className="flex items-center space-x-2">
                <Zap className="text-purple-500" />
                <span className="text-sm">Enhanced transaction routing</span>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart2 className="text-indigo-500" />
                <span className="text-sm">Advanced analytics</span>
              </div>
            </div>
          )}
          <div className="pt-4">
            <Button variant="outline" className="w-full">
              <RefreshCcw className="mr-2 h-4 w-4" /> Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const NFTOverview = () => {
  const [selectedNFT, setSelectedNFT] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const nfts = [
    { id: 1, name: "Solana Monkey #1234", image: "/placeholder.svg?height=100&width=100", price: "10.5 SOL" },
    { id: 2, name: "Degenerate Ape #5678", image: "/placeholder.svg?height=100&width=100", price: "15.2 SOL" },
    { id: 3, name: "Okay Bears #9101", image: "/placeholder.svg?height=100&width=100", price: "8.7 SOL" },
  ]

  const handleGenerateNFT = () => {
    setIsGenerating(true)
    // Simulating NFT generation process
    setTimeout(() => {
      setIsGenerating(false)
      // Add newly generated NFT to the list (in a real app, this would come from an API)
      const newNFT = { id: nfts.length + 1, name: `Generated NFT #${nfts.length + 1}`, image: "/placeholder.svg?height=100&width=100", price: "5.0 SOL" }
      nfts.push(newNFT)
      setSelectedNFT(newNFT)
    }, 2000)
  }

  const handleDeleteNFT = (id) => {
    const index = nfts.findIndex(nft => nft.id === id)
    if (index !== -1) {
      nfts.splice(index, 1)
      setSelectedNFT(null)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">NFT Overview</CardTitle>
        <CardDescription>Your latest NFT transactions and holdings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {nfts.map((nft) => (
            <div key={nft.id} className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={nft.image} alt={nft.name} />
                <AvatarFallback><ImageIcon className="h-6 w-6" /></AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{nft.name}</p>
                <p className="text-sm text-muted-foreground">{nft.price}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedNFT(nft)}>
                View <Eye className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-4">
          <Button className="w-full" onClick={handleGenerateNFT} disabled={isGenerating}>
            {isGenerating ? (
              <>Generating... <Wand2 className="ml-2 h-4 w-4 animate-spin" /></>
            ) : (
              <>Generate NFT <Wand2 className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </div>
        {selectedNFT && (
          <div className="mt-6 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">{selectedNFT.name}</h3>
            <img src={selectedNFT.image} alt={selectedNFT.name} className="w-full h-48 object-cover rounded-lg mb-4" />
            <p className="text-sm mb-4">Price: {selectedNFT.price}</p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleDeleteNFT(selectedNFT.id)}>
                Delete <Trash className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                Download <Download className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const BlinkTypes = () => {
  const types = [
    { icon: Heart, name: "Donations", description: "Accept donations for your cause or charity. Set up recurring or one-time donation options." },
    { icon: CreditCard, name: "Payments", description: "Receive instant  payments for goods or services. Ideal for e-commerce and service providers." },
    { icon: Repeat, name: "Transactions", description: "Transfer funds between accounts quickly and securely. Great for personal or business use." },
    { icon: FileText, name: "Memo", description: "Add detailed notes to your transactions for better record-keeping and transparency." },
    { icon: Gift, name: "Gift", description: "Send cryptocurrency gifts to friends or family. Perfect for special occasions or rewards." },
    { icon: Zap, name: "Subscription", description: "Set up recurring payments for subscription-based services or memberships." },
    { icon: Shuffle, name: "Swap", description: "Exchange one token for another seamlessly. Access a wide range of cryptocurrencies." },
    { icon: Vote, name:  "Governance", description: "Participate in on-chain voting for decentralized decision-making in DAOs or projects." },
    { icon: Printer, name: "Mint", description: "Create new tokens or NFTs. Ideal for artists, creators, or new project launches." },
    { icon: Lock, name: "Escrow", description: "Secure funds in a third-party account for conditional transactions or dispute resolution." },
    { icon: DollarSign, name: "Token Sales", description: "Conduct token sales, ICOs, or fundraising events with built-in compliance features." },
    { icon: MessageSquare, name: "Text Request", description: "Request payments via text message. Great for quick, informal transactions." }
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {types.map((type) => (
        <Card key={type.name} className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <type.icon className="mr-2 h-5 w-5 text-primary" />
              {type.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground">{type.description}</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline">Learn More</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

const SubscriptionPlans = () => {
  const plans = [
    {
      name: "Starter",
      price: "$9.99",
      features: [
        "100 Blinks per month",
        "Basic analytics",
        "Email support",
        "1 user"
      ],
      isCurrent: true
    },
    {
      name: "Pro",
      price: "$29.99",
      features: [
        "Unlimited Blinks",
        "Advanced analytics",
        "Priority support",
        "5 users"
      ],
      isCurrent: false
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: [
        "Unlimited Blinks",
        "Custom analytics",
        "24/7 dedicated support",
        "Unlimited users"
      ],
      isCurrent: false
    }
  ]

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {plans.map((plan) => (
        <Card key={plan.name} className={`flex flex-col ${plan.isCurrent ? "border-primary shadow-lg" : ""}`}>
          <CardHeader className="text-center">
            {plan.isCurrent && (
              <Badge className="absolute top-4 right-4" variant="secondary">
                Current Plan
              </Badge>
            )}
            <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
            <CardDescription>
              <span className="text-4xl font-bold">{plan.price}</span>
              {plan.name !== "Enterprise" && <span className="text-sm">/ month</span>}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant={plan.isCurrent ? "outline" : "default"}>
              {plan.isCurrent ? "Current Plan" : "Upgrade"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

const CommunitySection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Join Our Community</CardTitle>
        <CardDescription>Help us build a better Blinkboard</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>Blinkboard is currently in its MVP (Minimum Viable Product) stage, and we're excited to grow with our community. Here's how you can get involved:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Contribute to our open-source codebase</li>
          <li>Suggest new features and use cases</li>
          <li>Participate in community discussions</li>
          <li>Help test new features before they're released</li>
        </ul>
        <Button className="w-full">
          Join Our Community <Users className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}

const APISection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Blinkboard API</CardTitle>
        <CardDescription>Integrate Blinkboard into your applications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>Our API allows developers to integrate Blinkboard's powerful features into their own applications. Here's what you can do:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Create and manage Blinks programmatically</li>
          <li>Retrieve transaction data and analytics</li>
          <li>Integrate Blinkboard's payment system into your app</li>
          <li>Customize the Blinkboard experience for your users</li>
        </ul>
        <Button className="w-full">
          Explore API Docs <Code className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}

const MintFeature = () => {
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [tokenSupply, setTokenSupply] = useState('')
  const [tokenType, setTokenType] = useState('SPL')
  const [currentMintSupply, setCurrentMintSupply] = useState('0')
  const [isNFT, setIsNFT] = useState(false)
  const [nftMetadata, setNftMetadata] = useState('')
  const [royaltyPercentage, setRoyaltyPercentage] = useState('0')
  const [nftType, setNftType] = useState('Image')
  const [previewImage, setPreviewImage] = useState('')

  const handleMint = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Minting token/NFT:', { 
      tokenName, 
      tokenSymbol, 
      tokenSupply, 
      tokenType,
      currentMintSupply,
      isNFT, 
      nftMetadata, 
      royaltyPercentage,
      nftType
    })
    // Reset form
    setTokenName('')
    setTokenSymbol('')
    setTokenSupply('')
    setTokenType('SPL')
    setCurrentMintSupply('0')
    setIsNFT(false)
    setNftMetadata('')
    setRoyaltyPercentage('0')
    setNftType('Image')
    setPreviewImage('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Mint Tokens or NFTs</CardTitle>
        <CardDescription>Create your own tokens or NFTs on the Solana blockchain</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleMint} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tokenName">Token/NFT Name</Label>
            <Input
              id="tokenName"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              placeholder="My Awesome Token"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tokenSymbol">Token Symbol</Label>
            <Input
              id="tokenSymbol"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              placeholder="MAT"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tokenType">Token Type</Label>
            <Select value={tokenType} onValueChange={setTokenType}>
              <SelectTrigger>
                <SelectValue placeholder="Select token type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SPL">Solana Program Library (SPL)</SelectItem>
                <SelectItem value="Solana">Solana Native</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tokenSupply">Total Supply</Label>
            <Input
              id="tokenSupply"
              type="number"
              value={tokenSupply}
              onChange={(e) => setTokenSupply(e.target.value)}
              placeholder="1000000"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentMintSupply">Current Mint Supply</Label>
            <Input
              id="currentMintSupply"
              type="number"
              value={currentMintSupply}
              onChange={(e) => setCurrentMintSupply(e.target.value)}
              placeholder="0"
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isNFT"
              checked={isNFT}
              onCheckedChange={setIsNFT}
            />
            <Label htmlFor="isNFT">Mint as NFT</Label>
          </div>
          {isNFT && (
            <>
              <div className="space-y-2">
                <Label htmlFor="nftType">NFT Type</Label>
                <Select value={nftType} onValueChange={setNftType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select NFT type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Image">Image</SelectItem>
                    <SelectItem value="Video">Video</SelectItem>
                    <SelectItem value="Audio">Audio</SelectItem>
                    <SelectItem value="3D">3D Model</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nftMetadata">NFT Metadata (JSON)</Label>
                <Textarea
                  id="nftMetadata"
                  value={nftMetadata}
                  onChange={(e) => setNftMetadata(e.target.value)}
                  placeholder='{"name": "My NFT", "description": "A unique digital asset", "image": "https://example.com/image.png"}'
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="royaltyPercentage">Royalty Percentage</Label>
                <Input
                  id="royaltyPercentage"
                  type="number"
                  value={royaltyPercentage}
                  onChange={(e) => setRoyaltyPercentage(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="previewImage">Preview Image URL</Label>
                <Input
                  id="previewImage"
                  type="url"
                  value={previewImage}
                  onChange={(e) => setPreviewImage(e.target.value)}
                  placeholder="https://example.com/preview.png"
                />
              </div>
              {previewImage && (
                <div className="mt-4">
                  <img src={previewImage} alt="NFT Preview" className="max-w-full h-auto rounded-lg" />
                </div>
              )}
              <Button type="button" className="mt-2">
                Download Image <Download className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}
          <Button type="submit" className="w-full">
            Mint Token/NFT <Printer className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function Blinkboard() {
  const [activeTab, setActiveTab] = useState("overview")

  const tabs = [
    { id: "overview", label: "Overview", icon: Info },
    { id: "demo", label: "Demo", icon: Zap },
    { id: "blink-types", label: "Blink Types", icon: Repeat },
    { id: "nfts", label: "NFTs", icon: ImageIcon },
    { id: "subscription", label: "Subscription", icon: CreditCard },
    { id: "community", label: "Community", icon: Users },
    { id: "api", label: "API", icon: Code },
    { id: "mint", label: "Mint", icon: Printer },
    { id: "get-started", label: "Get Started", icon: ArrowRight }
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-foreground mb-4">Experience Blinkboard MVP</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Lightning-fast transactions, powerful features, and an intuitive interface for Solana. Join us in shaping the future of blockchain interactions!
          </p>
        </motion.div>

        <div className="mb-8">
          <nav className="flex flex-wrap justify-center gap-2 bg-muted p-2 rounded-lg">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center space-x-2"
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </Button>
            ))}
          </nav>
        </div>

        <div className="mt-8">
          {activeTab === "overview" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Welcome to Blinkboard MVP</CardTitle>
                <CardDescription>Explore our features and help shape the future of blockchain interactions</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="aspect-video mb-6">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="Blinkboard Overview"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <img
                  src="/placeholder.svg?height=400&width=800"
                  alt="Blinkboard Interface"
                  className="w-full rounded-lg shadow-lg"
                />
                <div className="mt-6 space-y-4">
                  <p>Blinkboard is currently in its MVP stage, and we're excited to have you on board as we continue to develop and improve our platform. Here's what you can explore in our tabs:</p>
                  <ul className="space-y-2">
                    {tabs.slice(1).map((tab) => (
                      <li key={tab.id} className="flex items-center">
                        <ChevronRight className="mr-2 h-4 w-4 text-primary" />
                        <strong>{tab.label}:</strong> <span className="ml-1">Explore {tab.label.toLowerCase()} features</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
          {activeTab === "demo" && <BlinkboardDemo />}
          {activeTab === "blink-types" && <BlinkTypes />}
          {activeTab === "nfts" && <NFTOverview />}
          {activeTab === "subscription" && <SubscriptionPlans />}
          {activeTab === "community" && <CommunitySection />}
          {activeTab === "api" && <APISection />}
          {activeTab === "mint" && <MintFeature />}
          {activeTab === "get-started" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Get Started with Blinkboard</CardTitle>
                <CardDescription>Join the future of fast, secure, and easy transactions on Solana</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Ready to experience the power of Blinkboard? Follow these simple steps:</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Create your Solana wallet</li>
                  <li>Fund your wallet with SOL</li>
                  <li>Connect your wallet to Blinkboard</li>
                  <li>Start creating Blinks!</li>
                </ol>
                <p className="text-sm text-muted-foreground mt-4">
                  Remember, Blinkboard is in its MVP stage. Your feedback and participation are crucial in shaping its future!
                </p>
                <Button size="lg" className="w-full mt-4">
                  Create Your Account
                  <ArrowRight className="ml-2 h-5 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  )
}