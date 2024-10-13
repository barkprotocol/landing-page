import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react'

const SwapIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 3l4 4-4 4" />
    <path d="M20 7H4" />
    <path d="M8 21l-4-4 4-4" />
    <path d="M4 17h16" />
  </svg>
)

interface Transaction {
  id: number
  type: string
  amount: number
  token: string
  fromToken?: string
  toToken?: string
  from?: string
  to?: string
  timestamp: string
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest activity on the Milton network</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center">
              <div className="mr-4">
                {tx.type === 'Received' && <ArrowDownRight className="h-6 w-6 text-green-500" />}
                {tx.type === 'Sent' && <ArrowUpRight className="h-6 w-6 text-red-500" />}
                {tx.type === 'Swapped' && <SwapIcon className="h-6 w-6 text-blue-500" />}
                {tx.type === 'Blink' && <Zap className="h-6 w-6 text-yellow-500" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{tx.type} {tx.amount} {tx.token || `${tx.fromToken} to ${tx.toToken}`}</p>
                <p className="text-xs text-muted-foreground">
                  {tx.from ? `From ${tx.from}` : tx.to ? `To ${tx.to}` : ''}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(tx.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}