'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/ui/layout/header'
import { Hero } from '@/components/ui/layout/hero'
import { Features } from '@/components/ui/layout/features'
import { About } from '@/components/ui/layout/about'
import { Tokenomics } from '@/components/ui/layout/tokenomics'
import { FAQ } from '@/components/ui/layout/faq'
import { CTA } from '@/components/ui/layout/cta'
import { Footer } from '@/components/ui/layout/footer'
import { Newsletter } from '@/components/ui/layout/newsletter'

const SolanaBlink = () => {
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const moveBlinkRandomly = () => {
      setIsVisible(false)
      setTimeout(() => {
        setPosition({
          x: Math.random() * 100,
          y: Math.random() * 100,
        })
        setIsVisible(true)
      }, 100)
    }

    const interval = setInterval(moveBlinkRandomly, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed w-3 h-3 bg-green-400 rounded-full z-50 shadow-lg"
          style={{ left: `${position.x}%`, top: `${position.y}%` }}
        />
      )}
    </AnimatePresence>
  )
}

const ScrollProgressBar = () => {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollPx = document.documentElement.scrollTop
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = `${scrollPx / winHeightPx * 100}%`
      setScrollProgress(scrolled)
    }

    window.addEventListener('scroll', updateScrollProgress)
    return () => window.removeEventListener('scroll', updateScrollProgress)
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: scrollProgress }}
      />
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <ScrollProgressBar />
      <SolanaBlink />
      <Header />
      <main className="flex-grow">
        <Hero />
        <Features />
        <About />
        <Tokenomics />
        <FAQ />
        <Newsletter />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}