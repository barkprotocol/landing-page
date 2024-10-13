import Link from 'next/link'
import { MessageCircle, Instagram, Github, Send } from 'lucide-react'
import { Icon } from '@iconify/react'

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <img
                className="h-12 w-12"
                src="https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg"
                alt="Milton"
              />
              <span className="text-2xl font-bold text-white">MILTON</span>
            </Link>
            <p className="text-gray-300 text-base max-w-xs">
              Revolutionizing meme culture with Solana blockchain technology. Join the blink revolution!
            </p>
            <div className="flex space-x-6">
              <a href="https://www.discord.gg" className="text-gray-400 hover:text-primary transition-colors duration-200">
                <span className="sr-only">Discord</span>
                <MessageCircle className="h-6 w-6" aria-hidden="true" />
              </a>
              <a href="https://www.x.com/milton.protocol" className="text-gray-400 hover:text-primary transition-colors duration-200">
                <span className="sr-only">X (formerly Twitter)</span>
                <Icon icon="ri:twitter-x-fill" className="h-6 w-6" aria-hidden="true" />
              </a>
              <a href="https://www.instagram.com/milton.protocol" className="text-gray-400 hover:text-primary transition-colors duration-200">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" aria-hidden="true" />
              </a>
              <a href="https://www.github.com/milton-protocol/" className="text-gray-400 hover:text-primary transition-colors duration-200">
                <span className="sr-only">GitHub</span>
                <Github className="h-6 w-6" aria-hidden="true" />
              </a>
              <a href="https://www.t.me/milton.protocol" className="text-gray-400 hover:text-primary transition-colors duration-200">
                <span className="sr-only">Telegram</span>
                <Send className="h-6 w-6" aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-secondary tracking-wider uppercase">Features</h3>
                <ul className="mt-4 space-y-4">
                  {['Blink Creation', 'Staking', 'NFT Marketplace', 'Governance'].map((item) => (
                    <li key={item}>
                      <Link href="#" className="text-base text-gray-300 hover:text-white transition-colors duration-200">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-secondary tracking-wider uppercase">Support</h3>
                <ul className="mt-4 space-y-4">
                  {['Documentation', 'Guides', 'API Status', 'Community'].map((item) => (
                    <li key={item}>
                      <Link href="https://www.doc.milton.protocol.com" className="text-base text-gray-300 hover:text-white transition-colors duration-200">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-secondary tracking-wider uppercase">About</h3>
                <ul className="mt-4 space-y-4">
                  {['About Milton', 'Blog', 'Brand Guide', 'Press Kit', 'Partners'].map((item) => (
                    <li key={item}>
                      <Link href="/pages/about" className="text-base text-gray-300 hover:text-white transition-colors duration-200">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-secondary tracking-wider uppercase">Legal</h3>
                <ul className="mt-4 space-y-4">
                  {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                    <li key={item}>
                      <Link href="https://www.milton.protocol.com/legal" className="text-base text-gray-300 hover:text-white transition-colors duration-200">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; {new Date().getFullYear()} Milton Protocol. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}