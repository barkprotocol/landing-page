'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Zap, ArrowRight, Clock } from "lucide-react"

interface BlinkTransaction {
  id: string
  recipient: string
  amount: number
  token: string
  timestamp: string
}

const recentBlinks: BlinkTransaction[] = [
  { id: '1', recipient: 'Alice', amount: 50, token: 'MILTON', timestamp: '2024-03-15T10:30:00Z' },
  { id: '2', recipient: 'Bob', amount: 25, token: 'SOL', timestamp: '2024-03-14T15:45:00Z' },
  { id: '3', recipient: 'Charlie', amount: 100, token: 'USDC', timestamp: '2024-03-13T09:20:00Z' },
]

export function BlinkDashboard() {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [token, setToken] = useState('MILTON')

  const handleSendBlink = () => {
    // In a real application, this would send the Blink transaction
    console.log(`Sending ${amount} ${token} to ${recipient}`)
    // Reset form
    setRecipient('')
    setAmount('')
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
          <Zap className="mr-2 h-6 w-6 text-yellow-500" />
          Blink Dashboard
        </CardTitle>
        <CardDescription>Send instant transactions with Milton Blinks</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="send" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="send">Send Blink</TabsTrigger>
            <TabsTrigger value="history">Blink History</TabsTrigger>
          </TabsList>
          <TabsContent value="send">
            <Card>
              <CardHeader>
                <CardTitle>Send a Blink</CardTitle>
                <CardDescription>Transfer tokens instantly to any Milton user</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient</Label>
                  <Input
                    id="recipient"
                    placeholder="Enter recipient's address or username"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token">Token</Label>
                  <select
                    id="token"
                    className="w-full p-2 border rounded"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                  >
                    <option value="MILTON">MILTON</option>
                    <option value="SOL">SOL</option>
                    <option value="USDC">USDC</option>
                  </select>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSendBlink} className="w-full">
                  <Zap className="mr-2 h-4 w-4" />
                  Send Blink
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Recent Blinks</CardTitle>
                <CardDescription>Your latest Blink transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBlinks.map((blink) => (
                    <div key={blink.id} className="flex items-center justify-between p-4 border rounded">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>{blink.recipient[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{blink.recipient}</p>
                          <p className="text-sm text-gray-500">{blink.amount} {blink.token}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="mr-1 h-4 w-4" />
                        {new Date(blink.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}