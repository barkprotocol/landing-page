import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Connection, clusterApiUrl } from '@solana/web3.js'

export function SolanaNetworkStatus() {
  const [tps, setTps] = useState<number | null>(null)
  const [slot, setSlot] = useState<number | null>(null)
  const [status, setStatus] = useState<'operational' | 'degraded' | 'down'>('operational')

  useEffect(() => {
    const connection = new Connection(clusterApiUrl('mainnet-beta'))
    
    const intervalId = setInterval(async () => {
      try {
        const perfSamples = await connection.getRecentPerformanceSamples(1)
        const recentSlot = await connection.getSlot()
        
        if (perfSamples.length > 0) {
          const sample = perfSamples[0]
          const currentTps = sample.numTransactions / sample.samplePeriodSecs
          setTps(Math.round(currentTps))
        }
        
        setSlot(recentSlot)
        setStatus('operational')
      } catch (error) {
        console.error('Error fetching Solana network status:', error)
        setStatus('degraded')
      }
    }, 10000) // Update every 10 seconds

    return () => clearInterval(intervalId)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solana Network Status</CardTitle>
        <CardDescription>Real-time Solana blockchain information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">Current TPS</p>
            <p className="text-2xl font-bold">{tps !== null ? tps : 'Loading...'}</p>
          </div>
          <div>
            
            <p className="text-sm font-medium">Latest Slot</p>
            <p className="text-2xl font-bold">{slot !== null ? slot : 'Loading...'}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Network Status</p>
            <Badge variant={status === 'operational' ? 'default' : status === 'degraded' ? 'warning' : 'destructive'}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}