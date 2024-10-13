import { ReactNode } from 'react'
import Link from 'next/link'

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <nav className="mb-8">
          <ul className="flex space-x-4">
            <li>
              <Link href="/legal/privacy-policy" className="text-secondary hover:text-primary transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/legal/terms-of-service" className="text-secondary hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/legal/cookie-policy" className="text-secondary hover:text-primary transition-colors">
                Cookie Policy
              </Link>
            </li>
          </ul>
        </nav>
        {children}
      </div>
    </div>
  )
}