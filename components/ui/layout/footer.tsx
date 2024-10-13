import Link from 'next/link'
import { Instagram, Github, Send } from 'lucide-react'
import { Icon } from '@iconify/react'

export function Footer() {
  const description = "Empowering charitable initiatives through blockchain innovation. Milton Protocol combines meme culture with Solana technology to create a fun and impactful giving experience."

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 sm:py-12 lg:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          <div className="space-y-6 col-span-1 sm:col-span-2 xl:col-span-2">
            <Link href="/" className="flex items-center space-x-2">
              <img
                className="h-10 w-10 sm:h-12 sm:w-12"
                src="https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg"
                alt="Milton"
              />
              <span className="text-xl sm:text-2xl font-bold text-white">MILTON</span>
            </Link>
            <p className="text-gray-300 text-sm sm:text-base max-w-xs">
              {description}
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="https://www.discord.gg" className="text-gray-400 hover:text-primary transition-colors duration-200">
                <span className="sr-only">Discord</span>
                <Icon icon="mdi:discord" className="h-6 w-6" aria-hidden="true" />
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
              <a href="https://medium.com/@milton.protocol" className="text-gray-400 hover:text-primary transition-colors duration-200">
                <span className="sr-only">Medium</span>
                <Icon icon="mdi:medium" className="h-6 w-6" aria-hidden="true" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-secondary tracking-wider uppercase mb-4">Features</h3>
            <ul className="space-y-3">
              {['Blink Creation', 'Swap', 'Staking', 'NFT Marketplace', 'Governance'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors duration-200">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-secondary tracking-wider uppercase mb-4">Support</h3>
            <ul className="space-y-3">
              {['Documentation', 'Guides', 'API Status', 'Community'].map((item) => (
                <li key={item}>
                  <Link href="https://www.doc.milton.protocol.com" className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors duration-200">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-secondary tracking-wider uppercase mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-use" className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors duration-200">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors duration-200">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-sm sm:text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Milton Protocol. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}