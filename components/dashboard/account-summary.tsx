'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowRight, Wallet } from 'lucide-react'

interface AccountDetails {
  name: string
  email: string
  avatar: string
  balance: number
}

const mockAccountDetails: AccountDetails = {
  name: "Alice Johnson",
  email: "alice@example.com",
  avatar: "https://api.dicebear.com/6.x/adventurer/svg?seed=Alice",
  balance: 1234.56
}

export function AccountSummary() {
  const [accountDetails, setAccountDetails] = React.useState<AccountDetails | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setAccountDetails(mockAccountDetails)
        setIsLoading(false)
      } catch (err) {
        setError("Failed to load account details. Please try again later.")
        setIsLoading(false)
      }
    }

    fetchAccountDetails()
  }, [])

  if (isLoading) {
    return <div className="text-center">Loading account details...</div>
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  if (!accountDetails) {
    return <div className="text-center">No account details available.</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Summary</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={accountDetails.avatar} alt={accountDetails.name} />
          <AvatarFallback>{accountDetails.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="text-2xl font-bold">{accountDetails.name}</h2>
          <p className="text-sm text-muted-foreground">{accountDetails.email}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Wallet className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <span className="text-2xl font-bold">${accountDetails.balance.toFixed(2)}</span>
        </div>
        <Button className="w-full">
          View Full Account Details
          <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      </CardContent>
    </Card>
  )
}