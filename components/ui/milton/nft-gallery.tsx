import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from 'framer-motion'

type NFT = {
  id: string
  name: string
  image: string
}

type NFTGalleryProps = {
  nfts: NFT[]
}

export function NFTGallery({ nfts }: NFTGalleryProps) {
  const [displayedNFTs, setDisplayedNFTs] = useState<NFT[]>([])
  const [hasMore, setHasMore] = useState(true)
  const observer = useRef<IntersectionObserver | null>(null)
  const loadingRef = useCallback((node: HTMLDivElement | null) => {
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreNFTs()
      }
    })
    if (node) observer.current.observe(node)
  }, [hasMore])

  const loadMoreNFTs = () => {
    const currentLength = displayedNFTs.length
    const more = nfts.slice(currentLength, currentLength + 12)
    setDisplayedNFTs((prev) => [...prev, ...more])
    if (currentLength + more.length >= nfts.length) {
      setHasMore(false)
    }
  }

  useEffect(() => {
    loadMoreNFTs()
  }, [])

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>NFT Gallery</CardTitle>
        <CardDescription>Your NFT collection</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedNFTs.map((nft, index) => (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-2">
                  <img src={nft.image} alt={nft.name} className="w-full h-40 object-cover rounded-md" />
                  <p className="mt-2 text-sm font-medium">{nft.name}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        {hasMore && <div ref={loadingRef} className="h-10" />}
      </CardContent>
    </Card>
  )
}