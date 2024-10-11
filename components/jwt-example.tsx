import React, { useState } from 'react'
import jwt from 'jsonwebtoken'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'

// Ensure you have installed @types/jsonwebtoken
// If not, run: npm i --save-dev @types/jsonwebtoken

interface JwtPayload {
  sub: string
  name: string
  iat: number
}

export default function JwtExample() {
  const [secret, setSecret] = useState<string>('')
  const [payload, setPayload] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const [decodedToken, setDecodedToken] = useState<JwtPayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateToken = () => {
    try {
      const parsedPayload = JSON.parse(payload)
      const newToken = jwt.sign(parsedPayload, secret, { expiresIn: '1h' })
      setToken(newToken)
      setError(null)
    } catch (err) {
      setError('Error generating token. Please check your payload and secret.')
    }
  }

  const decodeToken = () => {
    try {
      const decoded = jwt.verify(token, secret) as JwtPayload
      setDecodedToken(decoded)
      setError(null)
    } catch (err) {
      setError('Error decoding token. Please check your token and secret.')
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>JWT Example</CardTitle>
        <CardDescription>Generate and decode JWT tokens</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="secret">Secret</Label>
          <Input
            id="secret"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Enter your secret"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="payload">Payload (JSON)</Label>
          <Input
            id="payload"
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            placeholder='{"sub": "1234567890", "name": "John Doe"}'
          />
        </div>
        <Button onClick={generateToken} className="w-full">Generate Token</Button>
        {token && (
          <div className="space-y-2">
            <Label htmlFor="token">Generated Token</Label>
            <Input id="token" value={token} readOnly />
          </div>
        )}
        <Button onClick={decodeToken} className="w-full" disabled={!token}>Decode Token</Button>
        {decodedToken && (
          <div className="space-y-2">
            <Label>Decoded Token</Label>
            <pre className="bg-secondary p-2 rounded-md overflow-x-auto">
              {JSON.stringify(decodedToken, null, 2)}
            </pre>
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}