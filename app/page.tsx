'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/ui/layout/header'
import { Hero } from '@/components/ui/layout/hero'
import { Features } from '@/components/ui/layout/features'
import { About } from '@/components/ui/layout/about'
import Tokenomics from '@/components/ui/layout/tokenomics'
import { FAQ } from '@/components/ui/layout/faq'
import { CTA } from '@/components/ui/layout/cta'
import { Footer } from '@/components/ui/layout/footer'
import { Newsletter } from '@/components/ui/layout/newsletter'

const ScrollProgressBar = () => {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollPx = document.documentElement.scrollTop
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const progress = (scrollPx / winHeightPx) * 100
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', updateScrollProgress)
    updateScrollProgress() // Initial call to set progress on mount

    return () => window.removeEventListener('scroll', updateScrollProgress)
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <ScrollProgressBar />
      <Header />
      <motion.main 
        className="flex-grow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Hero />
        <Features />
        <About />
        <Tokenomics />
        <FAQ />
        <CTA />
        <Newsletter />
      </motion.main>
      <Footer />
    </div>
  )
}