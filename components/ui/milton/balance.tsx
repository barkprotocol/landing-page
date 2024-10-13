import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface BalanceProps {
  balance: number
  tokenSymbol: string
}

export function Balance({ balance, tokenSymbol }: BalanceProps) {
  const { toast } = useToast()

  const handleRefresh = () => {
    toast({
      title: "Balance Refreshed",
      description: "Your balance has been updated.",
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Your Balance</CardTitle>
        <CardDescription>Current balance of your MILTON tokens</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold">{balance.toLocaleString()} {tokenSymbol}</p>
            <p className="text-sm text-muted-foreground">≈ ${(balance * 0.1).toLocaleString()} USD</p>
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-6 flex space-x-4">
          <Button className="flex-1">
            <ArrowUpRight className="mr-2 h-4 w-4" /> Send
          </Button>
          <Button className="flex-1">
            <ArrowDownRight className="mr-2 h-4 w-4" /> Receive
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}