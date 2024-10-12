'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, Zap, Coins, BarChart2, Image as ImageIcon, Info, RefreshCcw, Gift, CreditCard, Repeat, FileText, Heart, Shuffle, Vote, Printer, Lock, Wand2, Eye, Check, DollarSign, Bell, Shield, MessageSquare, Trash, Download, Users, Code, ChevronRight, Play, Moon, Sun } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

// Import sub-components
import BlinkboardDemo from './components/blinkboard-demo'
import NFTOverview from './components/nft-overview'
import BlinkTypes from './components/blink-types'
import SubscriptionPlans from './components/subscription-plans'
import CommunitySection from './components/community-section'
import APISection from './components/api'
import MintFeature from './components/mint-feature'

const demoApplications = [
  { name: "Instant Payments", image: "/placeholder.svg?height=300&width=400", description: "Experience lightning-fast Solana transactions" },
  { name: "NFT Marketplace", image: "/placeholder.svg?height=300&width=400", description: "Create, buy, and sell unique digital assets" },
  { name: "DeFi Dashboard", image: "/placeholder.svg?height=300&width=400", description: "Manage your decentralized finance portfolio" },
  { name: "DAO Governance", image: "/placeholder.svg?height=300&width=400", description: "Participate in decentralized decision-making" },
]

const DemoCarousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  }

  return (
    <Slider {...settings}>
      {demoApplications.map((app, index) => (
        <div key={index} className="px-2">
          <Card>
            <CardContent className="p-6">
              <Image src={app.image} alt={app.name} width={400} height={300} className="rounded-lg mb-4" />
              <h3 className="text-xl font-semibold mb-2">{app.name}</h3>
              <p className="text-muted-foreground">{app.description}</p>
            </CardContent>
          </Card>
        </div>
      ))}
    </Slider>
  )
}

const VideoPresentation = () => {
  return (
    <div className="aspect-video">
      <iframe
        width="100%"
        height="100%"
        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
        title="Blinkboard Presentation"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  )
}

const Overview = ({ tabs, handleOpenVideoPresentation }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-2xl font-bold">Welcome to Blinkboard MVP</CardTitle>
      <CardDescription>Explore our features and help shape the future of blockchain interactions</CardDescription>
    </CardHeader>
    <CardContent className="p-6">
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Featured Demo Applications</h3>
        <DemoCarousel />
      </div>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Blinkboard Presentation</h3>
        <VideoPresentation />
      </div>
      <div className="flex justify-center mt-6">
        <Button onClick={handleOpenVideoPresentation} size="lg">
          <Play className="mr-2 h-4 w-4" /> Open Full Presentation
        </Button>
      </div>
      <div className="mt-8 space-y-4">
        <p>Blinkboard is revolutionizing blockchain interactions. Here's what you can explore in our MVP:</p>
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
)

const GetStarted = () => (
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
)

export default function Blinkboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [theme, setTheme] = useState("light")
  const router = useRouter()

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

  useEffect(() => {
    // Simulating data loading
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    // Check for user's preferred theme
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(userPrefersDark ? 'dark' : 'light')
  }, [])

  const handleOpenVideoPresentation = () => {
    router.push('/ui/video-presentation')
  }

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Zap className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    )
  }

  return (
    <section className={`py-24 bg-gradient-to-b ${theme === 'light' ? 'from-background to-secondary/20' : 'from-gray-900 to-gray-800'}`}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-end mb-4">
          <Button variant="outline" size="icon" onClick={toggleTheme}>
            {theme === 'light' ? <Moon className="h-[1.2rem] w-[1.2rem]" /> : <Sun className="h-[1.2rem] w-[1.2rem]" />}
          </Button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className={`text-4xl font-bold mb-4 ${theme === 'light' ? 'text-foreground' : 'text-white'}`}>Experience Blinkboard MVP</h2>
          <p className={`text-xl max-w-3xl mx-auto ${theme === 'light' ? 'text-muted-foreground' : 'text-gray-300'}`}>
            Lightning-fast transactions, powerful features, and an intuitive interface for Solana. Join us in shaping the future of blockchain interactions!
          </p>
        </motion.div>

        <div className="mb-8">
          <nav className={`flex flex-wrap justify-center gap-2 p-2 rounded-lg ${theme === 'light' ? 'bg-muted' : 'bg-gray-700'}`}>
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 ${theme === 'dark' && 'text-white hover:text-gray-200'}`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </Button>
            ))}
          </nav>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="mt-8"
          >
            {activeTab === "overview" && <Overview tabs={tabs} handleOpenVideoPresentation={handleOpenVideoPresentation} />}
            {activeTab === "demo" && <BlinkboardDemo />}
            {activeTab === "blink-types" && <BlinkTypes />}
            {activeTab === "nfts" && <NFTOverview />}
            {activeTab === "subscription" && <SubscriptionPlans />}
            {activeTab === "community" && <CommunitySection />}
            {activeTab === "api" && <APISection />}
            {activeTab === "mint" && <MintFeature />}
            {activeTab === "get-started" && <GetStarted />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}