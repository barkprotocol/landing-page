'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Image as ImageIcon, Eye, Wand2, Trash, Download } from 'lucide-react'

const NFTOverview = () => {
  const [selectedNFT, setSelectedNFT] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const nfts = [
    { id: 1, name: "Solana Monkey #1234", image: "/placeholder.svg?height=100&width=100", price: "10.5 SOL" },
    { id: 2, name: "Degenerate Ape #5678", image: "/placeholder.svg?height=100&width=100", price: "15.2 SOL" },
    { id: 3, name: "Okay Bears #9101", image: "/placeholder.svg?height=100&width=100", price: "8.7 SOL" },
  ]

  const handleGenerateNFT = () => {
    setIsGenerating(true)
    // Simulating NFT generation process
    setTimeout(() => {
      setIsGenerating(false)
      // Add newly generated NFT to the list (in a real app, this would come from an API)
      const newNFT = { id: nfts.length + 1, name: `Generated NFT #${nfts.length + 1}`, image: "/placeholder.svg?height=100&width=100", price: "5.0 SOL" }
      nfts.push(newNFT)
      setSelectedNFT(newNFT)
    }, 2000)
  }

  const handleDeleteNFT = (id) => {
    const index = nfts.findIndex(nft => nft.id === id)
    if (index !== -1) {
      nfts.splice(index, 1)
      setSelectedNFT(null)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">NFT Overview</CardTitle>
        <CardDescription>Your latest NFT transactions and holdings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {nfts.map((nft) => (
            <div key={nft.id} className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={nft.image} alt={nft.name} />
                <AvatarFallback><ImageIcon className="h-6 w-6" /></AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{nft.name}</p>
                <p className="text-sm text-muted-foreground">{nft.price}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedNFT(nft)}>
                View <Eye className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-4">
          <Button className="w-full" onClick={handleGenerateNFT} disabled={isGenerating}>
            {isGenerating ? (
              <>Generating... <Wand2 className="ml-2 h-4 w-4 animate-spin" /></>
            ) : (
              <>Generate NFT <Wand2 className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </div>
        {selectedNFT && (
          <div className="mt-6 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">{selectedNFT.name}</h3>
            <img src={selectedNFT.image} alt={selectedNFT.name} className="w-full h-48 object-cover rounded-lg mb-4" />
            <p className="text-sm mb-4">Price: {selectedNFT.price}</p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleDeleteNFT(selectedNFT.id)}>
                Delete <Trash className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                Download <Download className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default NFTOverview