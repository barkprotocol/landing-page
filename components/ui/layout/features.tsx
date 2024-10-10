'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@iconify/react'
import { FeatureCard } from '../feature-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function Features() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null)

  const features = [
    {
      icon: 'ri-tornado-line',
      title: "Meme Tornado",
      description: "Harness the power of Milton's tornado legs to spin up viral meme campaigns and boost your token value.",
      details: "Our AI-powered Meme Tornado algorithm analyzes trending topics and automatically generates hilarious memes to keep your MILTON tokens in the spotlight."
    },
    {
      icon: 'ri-flashlight-line',
      title: "Lightning-Fast Transactions",
      description: "Experience the speed of Solana with Milton. Blink, and you might miss it!",
      details: "MILTON transactions are processed in milliseconds, allowing for real-time meme trading and instant gratification in the world of crypto humor."
    },
    {
      icon: 'ri-coin-line',
      title: "Meme-to-Earn",
      description: "Create and share Milton memes to earn token rewards. The funnier, the better!",
      details: "Our decentralized meme marketplace uses a unique algorithm to reward creators based on community engagement, virality, and overall meme quality."
    },
    {
      icon: 'ri-emotion-laugh-line',
      title: "NFT Meme Gallery",
      description: "Collect and trade unique Milton-inspired meme NFTs in our exclusive gallery.",
      details: "Each meme NFT is minted with provable rarity and comes with special perks in the MILTON ecosystem, including exclusive access to meme-creation tools and premium content."
    },
    {
      icon: 'ri-line-chart-line',
      title: "DeFi Integration",
      description: "Stake your MILTON tokens in our meme-powered yield farms for hilarious returns.",
      details: "Our innovative 'Laugh-Fi' protocol combines traditional DeFi principles with meme engagement metrics to determine yield rates, creating a truly unique and entertaining financial experience."
    },
    {
      icon: 'ri-group-line',
      title: "Community Governance",
      description: "Participate in DAO voting with a twist - the most upvoted meme proposals win!",
      details: "MILTON holders can submit meme-based proposals for ecosystem improvements, with voting power determined by both token holdings and meme creation history."
    }
  ]

  const handleHover = useCallback((index: number | null) => {
    setHoveredIndex(index)
  }, [])

  const handleFeatureClick = useCallback((index: number) => {
    setSelectedFeature(index === selectedFeature ? null : index)
  }, [selectedFeature])

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-white to-gray-100 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 
          className="text-4xl font-bold text-center text-gray-900 mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Milton's Meme-Powered Features
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onMouseEnter={() => handleHover(index)}
              onMouseLeave={() => handleHover(null)}
              onClick={() => handleFeatureClick(index)}
            >
              <FeatureCard
                icon={<Icon icon={feature.icon} className="w-8 h-8 text-primary" />}
                title={feature.title}
                description={feature.description}
                isHovered={hoveredIndex === index}
                isSelected={selectedFeature === index}
              />
            </motion.div>
          ))}
        </div>
        <AnimatePresence>
          {selectedFeature !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle>{features[selectedFeature].title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{features[selectedFeature].details}</p>
                  <Button onClick={() => handleFeatureClick(selectedFeature)} variant="outline">
                    Close
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}