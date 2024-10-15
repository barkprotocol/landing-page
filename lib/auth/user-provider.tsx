'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { User } from '@/types/user'

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { publicKey, connected } = useWallet()

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)
      try {
        if (connected && publicKey) {
          const response = await fetch('/api/user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ walletAddress: publicKey.toString() }),
          })

          if (response.ok) {
            const userData: User = await response.json()
            setUser(userData)
          } else {
            console.error('Failed to fetch user data')
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [connected, publicKey])

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}