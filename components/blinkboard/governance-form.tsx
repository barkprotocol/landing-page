'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction } from '@solana/web3.js'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

const governanceSchema = z.object({
  proposalTitle: z.string().min(1, 'Proposal title is required'),
  proposalDescription: z.string().min(1, 'Proposal description is required'),
  votingPeriod: z.number().int().positive('Voting period must be a positive integer'),
})

interface GovernanceFormProps {
  isDarkMode: boolean
}

export function GovernanceForm({ isDarkMode }: GovernanceFormProps) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(governanceSchema)
  })

  const onSubmit = async (data) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to submit a governance proposal.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // TODO: Implement the actual governance proposal submission logic here
      // This is a placeholder for the actual Solana transaction
      const transaction = new Transaction()
      // Add instructions to the transaction here

      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = wallet.publicKey

      const signedTransaction = await wallet.signTransaction(transaction)
      const signature = await connection.sendRawTransaction(signedTransaction.serialize())

      await connection.confirmTransaction(signature)

      toast({
        title: "Proposal Submitted",
        description: "Your governance proposal has been successfully submitted.",
      })

      reset()
    } catch (error) {
      console.error('Error submitting governance proposal:', error)
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}>
      <CardHeader>
        <CardTitle>Submit Governance Proposal</CardTitle>
        <CardDescription>Create a new proposal for the community to vote on</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="proposalTitle">Proposal Title</Label>
            <Input id="proposalTitle" {...register('proposalTitle')} />
            {errors.proposalTitle && <p className="text-red-500">{errors.proposalTitle.message}</p>}
          </div>
          <div>
            <Label htmlFor="proposalDescription">Proposal Description</Label>
            <Textarea id="proposalDescription" {...register('proposalDescription')} />
            {errors.proposalDescription && <p className="text-red-500">{errors.proposalDescription.message}</p>}
          </div>
          <div>
            <Label htmlFor="votingPeriod">Voting Period (in days)</Label>
            <Input id="votingPeriod" type="number" {...register('votingPeriod', { valueAsNumber: true })} />
            {errors.votingPeriod && <p className="text-red-500">{errors.votingPeriod.message}</p>}
          </div>
          <Button type="submit" disabled={isLoading || !wallet.connected}>
            {isLoading ? 'Submitting...' : 'Submit Proposal'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}