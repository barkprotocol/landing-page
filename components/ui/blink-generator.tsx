'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap } from 'lucide-react'

interface BlinkProps {
  color: string
  duration: number
}

const Blink: React.FC<BlinkProps> = ({ color, duration }) => (
  <div 
    className="w-4 h-4 rounded-full"
    style={{
      backgroundColor: color,
      animation: `blink ${duration}s infinite`
    }}
  />
)

export function SolanaBlinkGenerator() {
  const [blinks, setBlinks] = useState<BlinkProps[]>([])
  const [color, setColor] = useState('#00FFA3')
  const [duration, setDuration] = useState(1)

  const generateBlink = () => {
    setBlinks([...blinks, { color, duration }])
  }

  const clearBlinks = () => {
    setBlinks([])
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center mb-4">Solana Blinks Generator</CardTitle>
            <CardDescription className="text-center">Create custom Solana-style blinks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex space-x-4">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full"
                />
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  min={0.1}
                  max={10}
                  step={0.1}
                  className="w-full"
                />
              </div>
              <div className="flex space-x-4">
                <Button onClick={generateBlink} className="w-full">
                  <Zap className="mr-2 h-4 w-4" />
                  Generate Blink
                </Button>
                <Button onClick={clearBlinks} variant="outline" className="w-full">
                  Clear All
                </Button>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              {blinks.map((blink, index) => (
                <Blink key={index} color={blink.color} duration={blink.duration} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <style jsx global>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </section>
  )
}