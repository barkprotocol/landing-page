'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Zap, Users, Heart, Globe, Rocket, Flame, FileText } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

export function Hero() {
  const router = useRouter()
  const [isHovering, setIsHovering] = useState(false)
  const [badgeText, setBadgeText] = useState('')
  const [badgeIcon, setBadgeIcon] = useState<React.ReactNode>(null)

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const cards = [
    { icon: Zap, title: "Fast Transactions", description: "Experience lightning-fast transactions on the Solana blockchain.", color: "text-yellow-400" },
    { icon: Users, title: "Community Driven", description: "Join a vibrant community of meme enthusiasts and Solana lovers.", color: "text-yellow-400" },
    { icon: Heart, title: "Disaster Relief", description: "Support global disaster relief efforts through MILTON transactions.", color: "text-yellow-400" },
    { icon: Globe, title: "Real-World Impact", description: "Use MILTON for charitable donations and social good initiatives.", color: "text-yellow-400" }
  ]

  useEffect(() => {
    const updateBadge = () => {
      const launchDate = new Date('2024-10-15')
      const currentDate = new Date()
      const daysSinceLaunch = Math.floor((currentDate.getTime() - launchDate.getTime()) / (1000 * 3600 * 24))

      if (daysSinceLaunch < 0) {
        setBadgeText(`Launching in ${Math.abs(daysSinceLaunch)} days`)
        setBadgeIcon(<Rocket className="w-4 h-4 mr-1" aria-hidden="true" />)
      } else if (daysSinceLaunch === 0) {
        setBadgeText('Launching Today!')
        setBadgeIcon(<Rocket className="w-4 h-4 mr-1" aria-hidden="true" />)
      } else if (daysSinceLaunch <= 30) {
        setBadgeText('New Launch')
        setBadgeIcon(<Flame className="w-4 h-4 mr-1" aria-hidden="true" />)
      } else {
        setBadgeText('') // No badge after 30 days
        setBadgeIcon(null)
      }
    }

    updateBadge()
    const timer = setInterval(updateBadge, 1000 * 60 * 60) // Update every hour

    return () => clearInterval(timer)
  }, [])

  const handleWhitepaperClick = () => {
    // Replace with actual whitepaper URL
    window.open('/whitepaper.pdf', '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="relative py-20 text-white overflow-hidden">
      <Image
        src="https://ucarecdn.com/4de9a21e-eea8-4546-bab1-c241ebe242cc/hurricane.jpeg"
        alt="Background image of a tornado symbolizing the power of Milton"
        fill
        style={{ objectFit: 'cover' }}
        quality={100}
        priority
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 to-gray-800/80" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center"
        >
          <div className="max-w-3xl mb-12">
            <AnimatePresence>
              {badgeText && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Badge className="mb-4 text-sm font-semibold bg-primary text-primary-foreground px-3 py-1 rounded-full inline-flex items-center">
                    {badgeIcon}
                    {badgeText}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-4 text-shadow-sm">
              Welcome to Milton
              <span className="block text-primary mt-2 text-shadow-sm">The Storm of Solana</span>
            </h1>
            <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-xl">
              Brace Yourself for the Fastest and Most Impactful Token on the Blockchain!
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/blinkboard" passHref legacyBehavior>
                <Button asChild className="w-full sm:w-48 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-md inline-flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl">
                  <a>
                    Blinkboard
                    <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                  </a>
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full sm:w-48 bg-transparent hover:bg-white/10 text-white font-semibold py-3 px-6 rounded-md inline-flex items-center justify-center border border-white transition-all duration-300 shadow-lg hover:shadow-xl"
                onClick={handleWhitepaperClick}
              >
                <FileText className="mr-2 h-5 w-5" aria-hidden="true" />
                Whitepaper
              </Button>
            </div>
          </div>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {cards.map((card, index) => (
              <motion.div
                key={card.title}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  <CardHeader className="pb-2 text-center">
                    <CardTitle className="text-xl font-semibold flex flex-col items-center">
                      <card.icon className={`mb-2 h-8 w-8 ${card.color}`} aria-hidden="true" />
                      <span className="text-white">{card.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-300 text-sm">{card.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}