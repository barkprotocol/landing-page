'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Zap, Lock, Bell, Shield, BarChart2, RefreshCcw } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

const BlinkboardDemo = () => {
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [blinkName, setBlinkName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('SOL')
  const [transactionSpeed, setTransactionSpeed] = useState(90)
  const [newFeatures, setNewFeatures] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Creating blink:', { blinkName, amount, recipient, paymentMethod, transactionSpeed, newFeatures })
    // Reset form
    setAmount('')
    setRecipient('')
    setBlinkName('')
    setPaymentMethod('SOL')
    setTransactionSpeed(90)
    setNewFeatures(false)
  }

  const calculateFee = () => {
    const baseFee = 0.05
    const speedMultiplier = transactionSpeed / 100
    return (baseFee + (speedMultiplier * 0.01)).toFixed(3)
  }

  const tokenIcons = {
    SOL: "https://cryptologos.cc/logos/solana-sol-logo.png?v=024",
    MILTON: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=024",
    USDC: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=024"
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create a Blink</CardTitle>
          <CardDescription>Send funds instantly on the Solana network</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="blinkName">Blink Name</Label>
              <Input
                id="blinkName"
                value={blinkName}
                onChange={(e) => setBlinkName(e.target.value)}
                placeholder="My Awesome Blink"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tokenIcons).map(([token, iconUrl]) => (
                    <SelectItem key={token} value={token}>
                      <div className="flex items-center">
                        <img src={iconUrl} alt={token} className="w-5 h-5 mr-2" />
                        {token}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                type="text"
                placeholder="Solana address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Transaction Speed</Label>
              <Slider
                min={0}
                max={100}
                step={10}
                value={[transactionSpeed]}
                onValueChange={(value) => setTransactionSpeed(value[0])}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Slow</span>
                <span>Fast</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="new-features"
                checked={newFeatures}
                onCheckedChange={setNewFeatures}
              />
              <Label htmlFor="new-features">Enable new features</Label>
            </div>
            <div className="text-sm text-muted-foreground">
              Creation fee: {calculateFee()} SOL + Solana transaction fee
            </div>
            <Button type="submit"   className="w-full">
              Send Blink <Zap className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Transaction Info</CardTitle>
          <CardDescription>Real-time updates and transaction details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Transaction Speed</span>
            <span className="text-sm font-medium text-yellow-600">Ultra Fast</span>
          </div>
          <Progress value={transactionSpeed} className="w-full" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Network Fee</Label>
              <p className="text-lg font-semibold">{calculateFee()} SOL</p>
            </div>
            <div>
              <Label className="text-sm">Estimated Time</Label>
              <p className="text-lg font-semibold">{Math.max(1, Math.round(10 - (transactionSpeed / 10)))} seconds</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Transaction Security</Label>
            <div className="flex items-center space-x-2">
              <Lock className="text-yellow-500" />
              <span className="text-sm text-yellow-500">Secure</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your transaction is protected by Solana's advanced encryption and consensus mechanism.
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Solana Network</Label>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">Mainnet</Badge>
              <Badge variant="success">Online</Badge>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Transaction Monitoring</Label>
            <div className="flex items-center space-x-2">
              <Bell className="text-yellow-500" />
              <span className="text-sm">Real-time alerts enabled</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Fraud Protection</Label>
            <div className="flex items-center space-x-2">
              <Shield className="text-orange-500" />
              <span className="text-sm">Active</span>
            </div>
          </div>
          {newFeatures && (
            <div className="space-y-2">
              <Label className="text-sm">New Features</Label>
              <div className="flex items-center space-x-2">
                <Zap className="text-purple-500" />
                <span className="text-sm">Enhanced transaction routing</span>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart2 className="text-indigo-500" />
                <span className="text-sm">Advanced analytics</span>
              </div>
            </div>
          )}
          <div className="pt-4">
            <Button variant="outline" className="w-full">
              <RefreshCcw className="mr-2 h-4 w-4" /> Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BlinkboardDemo