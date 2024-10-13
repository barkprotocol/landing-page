'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Zap, Image, Coins, Sparkles } from "lucide-react"

type GeneratorType = 'blink' | 'nft' | 'content'

interface GeneratedItem {
  type: GeneratorType
  content: string
}

export function Generator() {
  const [prompt, setPrompt] = useState('')
  const [generatorType, setGeneratorType] = useState<GeneratorType>('content')
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    setIsLoading(true)
    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    let newItem: GeneratedItem

    switch (generatorType) {
      case 'blink':
        newItem = {
          type: 'blink',
          content: `Generated Blink transaction: Send 10 MILTON to ${prompt}`
        }
        break
      case 'nft':
        newItem = {
          type: 'nft',
          content: `Generated NFT: "${prompt}" - Unique digital asset on the Milton network`
        }
        break
      default:
        newItem = {
          type: 'content',
          content: `Generated content based on: "${prompt}"`
        }
    }

    setGeneratedItems(prev => [newItem, ...prev])
    setIsLoading(false)
  }

  return (
    <Card className="w-full bg-white border-primary/20 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-primary flex items-center">
          <Sparkles className="mr-2 h-6 w-6 text-primary" />
          Milton AI Generator
        </CardTitle>
        <CardDescription className="text-primary/60">
          Harness the power of AI to generate Blinks, NFTs, or content on the Milton network
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="generator-type" className="text-sm font-medium text-primary">Generator Type</label>
            <Select onValueChange={(value: GeneratorType) => setGeneratorType(value)}>
              <SelectTrigger id="generator-type" className="border-primary/20 focus:ring-primary">
                <SelectValue placeholder="Select generator type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blink">Blink Generator</SelectItem>
                <SelectItem value="nft">NFT Generator</SelectItem>
                <SelectItem value="content">Content Generator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium text-primary">Prompt</label>
            <Input
              id="prompt"
              placeholder="Enter your prompt here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="border-primary/20 focus:ring-primary"
            />
          </div>
          <Button 
            onClick={handleGenerate} 
            disabled={isLoading || !prompt}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 ease-in-out transform hover:scale-105"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <AnimatePresence>
          {generatedItems.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full space-y-4 mt-4"
            >
              <h3 className="text-lg font-semibold text-primary">Generated Items</h3>
              {generatedItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gray-50 border-primary/10 hover:border-primary/30 transition-all duration-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center text-primary">
                        {item.type === 'blink' && <Zap className="mr-2 h-4 w-4 text-yellow-500" />}
                        {item.type === 'nft' && <Image className="mr-2 h-4 w-4 text-blue-500" />}
                        {item.type === 'content' && <Coins className="mr-2 h-4 w-4 text-green-500" />}
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground">{item.content}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <p className="text-sm text-primary/60 mt-4">Powered by Milton AI</p>
      </CardFooter>
    </Card>
  )
}