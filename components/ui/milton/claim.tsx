"use client";

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ClaimProps {
  isOpen: boolean
  onClose: () => void
  airdrop: {
    name: string
    amount: string
  }
}

export function Claim({ isOpen, onClose, airdrop }: ClaimProps) {
  const [isClaiming, setIsClaiming] = useState(false)
  const { toast } = useToast()

  const handleClaim = async () => {
    setIsClaiming(true)
    // Simulate API call or blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsClaiming(false)
    toast({
      title: "Airdrop Claimed!",
      description: `You have successfully claimed ${airdrop.amount} from the ${airdrop.name} airdrop.`,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Claim MILTON Airdrop</DialogTitle>
          <DialogDescription>
            You are about to claim tokens from the {airdrop.name} airdrop.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            Airdrop Amount: <span className="font-semibold text-foreground">{airdrop.amount}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Please ensure your wallet is connected and you have sufficient gas fees before claiming.
          </p>
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleClaim} disabled={isClaiming}>
            {isClaiming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Claiming...
              </>
            ) : (
              'Claim MILTON'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}