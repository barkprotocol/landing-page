import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react'

interface TokenData {
  name: string
  balance: number
  value: number
  change: number
}

interface TokenBalancesProps {
  tokenData: TokenData[]
  totalBalance: number
}

export function TokenBalances({ tokenData, totalBalance }: TokenBalancesProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalBalance.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">+10.1% from last month</p>
        </CardContent>
      </Card>
      {tokenData.map((token) => (
        <Card key={token.name}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{token.name}</CardTitle>
            <Avatar className="h-4 w-4">
              <AvatarImage src={`/tokens/${token.name.toLowerCase()}.png`} alt={token.name} />
              <AvatarFallback>{token.name[0]}</AvatarFallback>
            </Avatar>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{token.balance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              ${token.value.toFixed(2)}
              <span className={`ml-2 ${token.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {token.change >= 0 ? <ArrowUpRight className="inline h-4 w-4" /> : <ArrowDownRight className="inline h-4 w-4" />}
                {Math.abs(token.change)}%
              </span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}