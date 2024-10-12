'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function GenerateTokenPage() {
  const [token, setToken] = useState('')

  const handleGenerateToken = async () => {
    const response = await fetch('/api/v1/generate-spl-token', { method: 'POST' })
    const data = await response.json()
    setToken(data.token)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Generate SPL Token</h1>
      <div className="flex space-x-2">
        <Input
          type="text"
          value={token}
          readOnly
          placeholder="Generated token will appear here"
          className="flex-grow"
        />
        <Button onClick={handleGenerateToken}>Generate Token</Button>
      </div>
    </div>
  )
}