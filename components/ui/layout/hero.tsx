'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Zap, Users, TrendingUp, X, Play, Rocket, Flame } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export function Hero() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [badgeText, setBadgeText] = useState('')
  const [badgeIcon, setBadgeIcon] = useState<React.ReactNode>(null)

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const cards = [
    { title: "Fast Transactions", icon: Zap, description: "Experience lightning-fast transactions on the Solana blockchain." },
    { title: "Community Driven", icon: Users, description: "Join a vibrant community of meme enthusiasts and Solana lovers." },
    { title: "Solana Blinks", icon: TrendingUp, description: "Explore cutting-edge Miltonboard features powered by Milton." }
  ]

  useEffect(() => {
    const updateBadge = () => {
      const launchDate = new Date('2024-10-12')
      const currentDate = new Date()
      const daysSinceLaunch = Math.floor((currentDate.getTime() - launchDate.getTime()) / (1000 * 3600 * 24))

      if (daysSinceLaunch < 0) {
        setBadgeText(`Launching in ${Math.abs(daysSinceLaunch)} days`)
        setBadgeIcon(<Rocket className="w-4 h-4 mr-1" />)
      } else if (daysSinceLaunch === 0) {
        setBadgeText('Launching Today!')
        setBadgeIcon(<Rocket className="w-4 h-4 mr-1" />)
      } else if (daysSinceLaunch <= 30) {
        setBadgeText('New Launch')
        setBadgeIcon(<Flame className="w-4 h-4 mr-1" />)
      } else {
        setBadgeText('') // No badge after 30 days
        setBadgeIcon(null)
      }
    }

    updateBadge()
    const timer = setInterval(updateBadge, 1000 * 60 * 60) // Update every hour

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative py-20 text-white overflow-hidden">
      <Image
        src="/images/tornado-on-transparent-background-free-png.webp"
        alt="Background tornado"
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
            {badgeText && (
              <Badge className="mb-4 text-sm font-semibold bg-primary text-primary-foreground px-3 py-1 rounded-full inline-flex items-center">
                {badgeIcon}
                {badgeText}
              </Badge>
            )}
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Welcome to Milton
              <span className="block text-primary">The Storm of Solana</span>
            </h1>
            <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-xl">
              The Storm of Solana: Brace Yourself for the Fastest, Funniest, and Most Chaotic Token on the Blockchain!
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="#buy-milton" passHref legacyBehavior>
                <Button asChild className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-full inline-flex items-center justify-center transition-colors duration-300">
                  <a>
                    Buy $MILTON
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto bg-transparent hover:bg-white/10 text-white font-semibold py-3 px-6 rounded-full inline-flex items-center justify-center border border-white transition-colors duration-300"
                onClick={() => setIsVideoPlaying(true)}
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Video
              </Button>
            </div>
          </div>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl"
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
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold flex items-center">
                      <card.icon className="mr-2 h-6 w-6 text-primary" />
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">{card.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
      <AnimatePresence>
        {isVideoPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 flex items-center justify-center z-50"
          >
            <div className="relative w-full max-w-4xl aspect-video">
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:text-gray-300"
                onClick={() => setIsVideoPlaying(false)}
              >
                <X className="h-6 w-6" />
                <span className="sr-only">Close video</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
