import { Card, CardContent } from "@/components/ui/card"

interface TokenBalancesProps {
  balances: Record<string, number> | null
  isDarkMode: boolean
}

export function TokenBalances({ balances, isDarkMode }: TokenBalancesProps) {
  if (!balances) {
    return <p>No token balances available.</p>
  }

  return (
    <div className="space-y-4">
      {Object.entries(balances).map(([token, balance]) => (
        <Card key={token} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <CardContent className="flex justify-between items-center p-4">
            <h3 className="font-semibold">{token}</h3>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {balance.toFixed(4)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
