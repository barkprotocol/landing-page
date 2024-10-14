'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Info } from 'lucide-react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from 'next/link'

export function About() {
  const [isHovered, setIsHovered] = useState(false)

  const features = [
    { 
      title: "Meme Economy", 
      description: "Create and trade meme-based assets", 
      details: "Participate in a vibrant NFT marketplace where creativity is rewarded with real economic value." 
    },
    { 
      title: "Social Engagement", 
      description: "Connect with meme enthusiasts globally", 
      details: "Join meme creation challenges, vote on trending content, and build your reputation in the meme community." 
    },
    { 
      title: "DeFi Integration", 
      description: "Earn yields with your memes", 
      details: "Stake your MILTON tokens in meme farms for rewards and participate in meme-backed lending protocols." 
    },
    { 
      title: "Charitable Initiatives", 
      description: "Meme for a cause", 
      details: "Participate in meme-driven charitable campaigns and help make a real-world impact through humor." 
    }
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            The Meme Thunder of Solana
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Revolutionizing meme culture on the Solana blockchain
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Image
              src="https://ucarecdn.com/137628fb-f546-490c-887a-1d0d3177f542/MiltonCard.png"
              alt="Milton Token Illustration"
              width={500}
              height={500}
              className="rounded-lg shadow-lg transition-transform duration-300 transform hover:scale-105"
            />
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-primary bg-opacity-75 rounded-lg flex items-center justify-center"
                >
                  <p className="text-primary-foreground text-2xl font-bold">Meme Magic Awaits!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-gray-900">
              About Milton
            </h3>
            <p className="text-lg text-gray-600">
              Milton Token (MILTON) is not just another meme coin; it's a revolution in the world of memes and blockchain technology. Built on the lightning-fast Solana network, Milton combines the power of decentralized finance with the viral nature of internet culture.
            </p>
            <p className="text-lg text-gray-600">
              Our mission is to create a vibrant ecosystem where creativity meets opportunity, and where meme enthusiasts can turn their passion into real value while making a positive impact on the world.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="bg-white shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <CardContent className="p-4">
                    <h4 className="text-lg font-semibold text-primary mb-2 flex items-center justify-between">
                      {feature.title}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-0">
                              <span className="sr-only">More info about {feature.title}</span>
                              <Info className="h-4 w-4 text-gray-400" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{feature.details}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/learn-more" passHref>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground group transition-all duration-300 ease-in-out transform hover:scale-105">
                  Explore Milton Ecosystem 
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}