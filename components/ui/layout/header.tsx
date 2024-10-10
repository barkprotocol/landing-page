'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Menu, X, FileText } from 'lucide-react'
import { WalletButton } from '@/components/ui/wallet-button'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { href: '#features', label: 'Features' },
  { href: '#tokenomics', label: 'Tokenomics' },
  { href: '#faq', label: 'FAQ' },
  { href: '#community', label: 'Community' },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 10)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const toggleMenu = () => setMenuOpen(!menuOpen)

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="https://ucarecdn.com/e02d02d3-5ef9-436a-aab2-d67f026110ce/miltonicon.png"
              alt="Milton Logo"
              width={50}
              height={50}
              className="w-12 h-12"
              priority
            />
            <span className={`text-2xl font-bold ${
              scrolled ? 'text-gray-900' : 'text-gray-900'
            }`}>MILTON</span>
          </Link>
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${
                  scrolled ? 'text-gray-600 hover:text-primary' : 'text-gray-900 hover:text-primary'
                } transition-colors`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex space-x-4 items-center">
            <WalletButton />
            <Button variant="outline" className="text-primary hover:bg-primary/10">
              <FileText className="mr-2 h-4 w-4" />
              Whitepaper
            </Button>
          </div>
          <button
            className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={toggleMenu}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X className={`h-6 w-6 ${scrolled ? 'text-gray-600' : 'text-gray-900'}`} />
            ) : (
              <Menu className={`h-6 w-6 ${scrolled ? 'text-gray-600' : 'text-gray-900'}`} />
            )}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white py-2"
          >
            <nav className="flex flex-col space-y-2 px-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-600 hover:text-primary transition-colors py-2"
                  onClick={toggleMenu}
                >
                  {item.label}
                </Link>
              ))}
              <WalletButton />
              <Button variant="outline" className="text-primary hover:bg-primary/10 w-full">
                <FileText className="mr-2 h-4 w-4" />
                Whitepaper
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}