import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Manrope } from 'next/font/google'
import { UserProvider } from '@/lib/auth'
import { getUser } from '@/lib/db/queries'
import { WalletProvider } from '@/components/ui/wallet-provider'

export const metadata: Metadata = {
  title: 'Milton',
  description: 'The Meme King of Solana - Experience the fastest, funniest, and most chaotic token on the Solana blockchain.',
}

export const viewport: Viewport = {
  maximumScale: 1,
  width: 'device-width',
  initialScale: 1,
}

const manrope = Manrope({ subsets: ['latin'] })

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  const userPromise = getUser()

  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50">
        <UserProvider userPromise={userPromise}>
          <WalletProvider>
            {children}
          </WalletProvider>
        </UserProvider>
      </body>
    </html>
  )
}