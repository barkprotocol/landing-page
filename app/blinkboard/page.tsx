'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, Zap, Coins, BarChart2, Image as ImageIcon, Info, RefreshCcw, Gift, CreditCard, Repeat, FileText, Heart, Shuffle, Vote, Printer, Lock, Wand2, Eye, Check, DollarSign, Bell, Shield, MessageSquare, Trash, Download, Users, Code, ChevronRight, Play } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { VideoPresentation } from "@/components/ui/video-presentation"

const BlinkboardDemo = () => {
  // Placeholder for BlinkboardDemo component
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-xl font-bold mb-2">Blinkboard Demo</h3>
      <p>This is a placeholder for the Blinkboard demo component.</p>
    </div>
  )
}

const NFTOverview = () => {
  // Placeholder for NFTOverview component
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-xl font-bold mb-2">NFT Overview</h3>
      <p>This is a placeholder for the NFT overview component.</p>
    </div>
  )
}

const BlinkTypes = () => {
  // Placeholder for BlinkTypes component
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-xl font-bold mb-2">Blink Types</h3>
      <p>This is a placeholder for the Blink types component.</p>
    </div>
  )
}

const SubscriptionPlans = () => {
  // Placeholder for SubscriptionPlans component
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-xl font-bold mb-2">Subscription Plans</h3>
      <p>This is a placeholder for the subscription plans component.</p>
    </div>
  )
}

const CommunitySection = () => {
  // Placeholder for CommunitySection component
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-xl font-bold mb-2">Community Section</h3>
      <p>This is a placeholder for the community section component.</p>
    </div>
  )
}

const APISection = () => {
  // Placeholder for APISection component
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-xl font-bold mb-2">API Section</h3>
      <p>This is a placeholder for the API section component.</p>
    </div>
  )
}

const MintFeature = () => {
  // Placeholder for MintFeature component
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-xl font-bold mb-2">Mint Feature</h3>
      <p>This is a placeholder for the mint feature component.</p>
    </div>
  )
}

export default function Blinkboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showVideo, setShowVideo] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState("/placeholder.svg?height=1080&width=1920&text=Default+Background")

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

  const interfaceImages = [
    "/placeholder.svg?height=400&width=800&text=Blinkboard+Interface+1",
    "/placeholder.svg?height=400&width=800&text=Blinkboard+Interface+2",
    "/placeholder.svg?height=400&width=800&text=Blinkboard+Interface+3",
  ]

  const handlePlayVideo = useCallback(() => {
    setShowVideo(true)
  }, [])

  const handleBackgroundChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setBackgroundImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <section className="py-24 relative" style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Experience Blinkboard</h2>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            Lightning-fast transactions, powerful features, and an intuitive interface for Solana. Join us in shaping the future of blockchain interactions!
          </p>
        </motion.div>

        <Card className="bg-white/10 backdrop-blur-md border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">Welcome to Blinkboard</CardTitle>
            <CardDescription className="text-gray-200">
              Blinkboard is a revolutionary platform that simplifies blockchain interactions on the Solana network. 
              Create, manage, and engage with various blockchain activities through our innovative Blink system. 
              Whether you're a seasoned blockchain enthusiast or new to the space, Blinkboard provides the tools 
              you need to participate in the decentralized future.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="mb-8">
              <nav className="flex flex-wrap justify-center gap-2 bg-white/20 p-2 rounded-lg">
                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center space-x-2 text-white"
                  >
                    <tab.icon className="w-4 h-4 text-[#FFE288]" />
                    <span>{tab.label}</span>
                  </Button>
                ))}
              </nav>
            </div>

            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="mb-6">
                  {showVideo ? (
                    <VideoPresentation
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                      title="Blinkboard Overview"
                    />
                  ) : (
                    <div className="relative aspect-video">
                      <img
                        src="/placeholder.svg?height=400&width=800&text=Blinkboard+Video+Thumbnail"
                        alt="Blinkboard Video Thumbnail"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <Button
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        onClick={handlePlayVideo}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        How it Works
                      </Button>
                    </div>
                  )}
                </div>
                <Carousel className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
                  <CarouselContent>
                    {interfaceImages.map((src, index) => (
                      <CarouselItem key={index}>
                        <img
                          src={src}
                          alt={`Blinkboard Interface ${index + 1}`}
                          className="w-full rounded-lg shadow-lg"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
                <div className="mt-6 space-y-4 text-white">
                  <p>Blinkboard is currently in its MVP stage, and we're excited to have you on board as we continue to develop and improve our platform. Here's what you can explore in our tabs:</p>
                  <ul className="space-y-2">
                    {tabs.slice(1).map((tab) => (
                      <li key={tab.id} className="flex items-center">
                        <ChevronRight className="mr-2 h-4 w-4 text-[#FFE288]" />
                        <strong>{tab.label}:</strong> <span className="ml-1">Explore {tab.label.toLowerCase()} features</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
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
                    <ArrowRight className="ml-2 h-5 w-4 text-[#FFE288]" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Label htmlFor="background-image" className="text-white">Change Background:</Label>
              <Input
                id="background-image"
                type="file"
                accept="image/*"
                onChange={handleBackgroundChange}
                className="w-full max-w-xs text-white"
              />
            </div>
            <Button variant="secondary">
              Get Started
              <ArrowRight className="ml-2 h-5 w-4 text-[#FFE288]" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  )
}