import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function Wallet() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Wallet Balance</CardTitle>
          <CardDescription>Your current Milton token balance</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">1,000 MILTON</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Send Tokens</CardTitle>
          <CardDescription>Transfer Milton tokens to another address</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input id="recipient" placeholder="Enter recipient's address" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" placeholder="Enter amount to send" />
            </div>
            <Button type="submit">Send Tokens</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}