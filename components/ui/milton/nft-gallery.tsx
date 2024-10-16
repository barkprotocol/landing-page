import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'

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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const observer = useRef<IntersectionObserver | null>(null)

  const loadingRef = useCallback((node: HTMLDivElement | null) => {
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        loadMoreNFTs()
      }
    })
    if (node) observer.current.observe(node)
  }, [hasMore, isLoading])

  const loadMoreNFTs = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulating API call
      const currentLength = displayedNFTs.length
      const more = nfts.slice(currentLength, currentLength + 12)
      setDisplayedNFTs((prev) => [...prev, ...more])
      if (currentLength + more.length >= nfts.length) {
        setHasMore(false)
      }
    } catch (err) {
      setError('Failed to load NFTs. Please try again.')
    } finally {
      setIsLoading(false)
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
        {error && (
          <p className="text-red-500 mb-4" role="alert">{error}</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {displayedNFTs.map((nft, index) => (
              <motion.div
                key={nft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-2">
                    <img 
                      src={nft.image} 
                      alt={nft.name} 
                      className="w-full h-40 object-cover rounded-md"
                      loading="lazy"
                    />
                    <p className="mt-2 text-sm font-medium">{nft.name}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {hasMore && (
          <div 
            ref={loadingRef} 
            className="h-20 flex items-center justify-center"
            aria-live="polite"
            aria-busy={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <p>Scroll for more</p>
            )}
          </div>
        )}
        {!hasMore && displayedNFTs.length > 0 && (
          <p className="text-center mt-4 text-muted-foreground">You've reached the end of your collection.</p>
        )}
        {!hasMore && displayedNFTs.length === 0 && (
          <p className="text-center mt-4 text-muted-foreground">No NFTs found in your collection.</p>
        )}
      </CardContent>
    </Card>
  )
}