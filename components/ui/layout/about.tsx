'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'

export function About() {
  const [isHovered, setIsHovered] = useState(false)

  const features = [
    { title: "Lightning Fast", description: "Built on Solana for blazing speed" },
    { title: "Meme Powered", description: "Fueled by the internet's best humor" },
    { title: "Community Driven", description: "Governed by meme enthusiasts" },
    { title: "DeFi Integration", description: "Earn yields with your memes" }
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4">
            About Milton
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
              src="/images/milton-token-illustration.png"
              alt="Milton Token Illustration"
              width={500}
              height={500}
              className="rounded-lg shadow-lg transition-transform duration-300 transform hover:scale-105"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-primary bg-opacity-75 rounded-lg flex items-center justify-center"
            >
              <p className="text-white text-2xl font-bold">Meme Magic Awaits!</p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-6"
          >
            <h3 className="text-3xl font-bold text-gray-900">
              The Meme Thunder of Solana
            </h3>
            <p className="text-lg text-gray-600">
              Milton Token is not just another cryptocurrency; it's a revolution in the world of memes and blockchain technology. Built on the lightning-fast Solana network, Milton combines the power of decentralized finance with the viral nature of internet culture.
            </p>
            <p className="text-lg text-gray-600">
              Our mission is to create a vibrant ecosystem where creativity meets opportunity, and where meme enthusiasts can turn their passion into real value.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              {features.map((feature, index) => (
                <Card key={index} className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-primary mb-2">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-white group transition-all duration-300 ease-in-out transform hover:scale-105">
              Learn More 
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}