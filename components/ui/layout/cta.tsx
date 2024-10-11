'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from '@/components/ui/use-toast'

export function CTA() {
  const [email, setEmail] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsModalOpen(false)
    
    try {
      // Simulating an API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Welcome to Milton!",
        description: "Get ready to create your first Blink NFT!",
      })
      
      // Redirect to blink creation page
      window.location.href = '/create-blink'
    } catch (error) {
      toast({
        title: "Oops! Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  return (
    <section className="py-24 bg-gradient-to-b from-sand-50 to-sand-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6">
            Ready to join the Milton madness?
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-600 mb-10">
            Don't miss out on the meme revolution! Create your Milton blinks NFT now and become part of the funniest and fastest-growing community on Solana.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex justify-center space-x-4"
          >
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-full text-lg px-8 py-4 inline-flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg">
                  Create Blink
                  <Zap className="ml-2 h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Join the Milton Community</DialogTitle>
                  <DialogDescription>
                    Enter your email to start creating your Milton blink NFT and stay updated on the latest meme trends!
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="mt-4">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mb-4"
                  />
                  <Button type="submit" className="w-full">
                    Start Creating
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="rounded-full text-lg px-8 py-4 inline-flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg">
              Learn More
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}