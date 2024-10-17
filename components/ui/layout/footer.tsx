import Link from 'next/link'
import { Instagram, Github, Send } from 'lucide-react'
import { Icon } from '@iconify/react'

export function Footer() {
  const description = "Empowering charitable initiatives through blockchain innovation. Milton Protocol combines meme culture with Solana technology to create a fun and impactful giving experience."

  const socialLinks = [
    { name: 'Discord', href: 'https://www.discord.gg', icon: 'mdi:discord' },
    { name: 'X (formerly Twitter)', href: 'https://www.x.com/milton.protocol', icon: 'ri:twitter-x-fill' },
    { name: 'Instagram', href: 'https://www.instagram.com/milton.protocol', icon: Instagram },
    { name: 'GitHub', href: 'https://www.github.com/milton-protocol/', icon: Github },
    { name: 'Telegram', href: 'https://www.t.me/milton.protocol', icon: Send },
    { name: 'Medium', href: 'https://medium.com/@milton.protocol', icon: 'mdi:medium' },
  ]

  const features = ['Blink Creation', 'Swap', 'Staking', 'NFT Marketplace', 'Governance']
  const support = ['Documentation', 'Guides', 'API Status', 'Community']
  const legal = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms-of-use' },
    { name: 'Cookie Policy', href: '/cookies' },
  ]

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          <div className="space-y-6 col-span-1 sm:col-span-2 xl:col-span-2">
            <Link href="/" className="flex items-center space-x-2">
              <img
                className="h-10 w-10 sm:h-12 sm:w-12"
                src="https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg"
                alt="Milton Logo"
              />
              <span className="text-xl sm:text-2xl font-bold text-white">MILTON</span>
            </Link>
            <p className="text-gray-300 text-sm sm:text-base max-w-xs">
              {description}
            </p>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href}
                  className="text-gray-400 hover:text-primary transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{link.name}</span>
                  {typeof link.icon === 'string' ? (
                    <Icon icon={link.icon} className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <link.icon className="h-6 w-6" aria-hidden="true" />
                  )}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-secondary tracking-wider uppercase mb-4">Features</h3>
            <ul className="space-y-3">
              {features.map((item) => (
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
              {support.map((item) => (
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
              {legal.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm sm:text-base text-gray-300 hover:text-white transition-colors duration-200">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-700">
          <p className="text-sm sm:text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Milton Protocol. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}