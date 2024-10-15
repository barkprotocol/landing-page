'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const tokens = [
  { symbol: 'MILTON', name: 'Milton Token', icon: 'https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg' },
  { symbol: 'BARK', name: 'Bark Token', icon: 'https://ucarecdn.com/8aa0180d-1112-4aea-8210-55b266c3fb44/bark.png' },
  { symbol: 'SOL', name: 'Solana', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png?v=024' },
  { symbol: 'USDC', name: 'USD Coin', icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=024' },
]

interface TokenSelectorProps {
  onSelect: (token: string) => void
}

export function TokenSelector({ onSelect }: TokenSelectorProps) {
  const [selectedToken, setSelectedToken] = useState(tokens[0].symbol)

  const handleTokenChange = (value: string) => {
    setSelectedToken(value)
    onSelect(value)
  }

  return (
    <Select value={selectedToken} onValueChange={handleTokenChange}>
      <SelectTrigger className="w-[180px]" aria-label="Select token">
        <SelectValue placeholder="Select token" />
      </SelectTrigger>
      <SelectContent>
        {tokens.map((token) => (
          <SelectItem key={token.symbol} value={token.symbol}>
            <div className="flex items-center">
              <div className="w-6 h-6 mr-2 relative">
                <Image 
                  src={token.icon} 
                  alt={`${token.name} logo`} 
                  layout="fill" 
                  objectFit="contain"
                  onError={(e) => {
                    e.currentTarget.src = 'https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg'
                  }}
                />
              </div>
              <span className="font-medium">{token.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}