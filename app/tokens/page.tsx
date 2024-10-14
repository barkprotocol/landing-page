'use client'

import { useState, useRef, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '@/components/ui/wallet-button'
import Preview from "@/components/preview"
import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Connection
} from '@solana/web3.js'
import { FaInfoCircle } from 'react-icons/fa'
import LoadingScreen from '@/components/ui/loading'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function TokenPage() {
  const { publicKey, connected, sendTransaction } = useWallet()
  const [icon, setIcon] = useState<string>('')
  const [label, setLabel] = useState<string>('')
  const [percentage, setPercentage] = useState<number>(0)
  const [takeCommission, setTakeCommission] = useState<string>("no")
  const [description, setDescription] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [mint, setMint] = useState<string>('')
  const [showPreview, setShowPreview] = useState(true)
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('Please Wait!')
  const [showForm, setShowForm] = useState(true)
  const [blinkLink, setBlinkLink] = useState('')
  const [copied, setCopied] = useState(false)
  const form = useRef<HTMLDivElement | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    setShowPreview(true)
  }, [mint])

  useEffect(() => {
    if (takeCommission === "no") {
      setPercentage(0)
    }
  }, [takeCommission])

  const handleSubmit = async () => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    if (!label || !description || !mint) {
      toast({
        title: "Incomplete form",
        description: "Please fill all fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setLoadingText('Waiting for Transaction confirmation!')

    try {
      const connection = new Connection('https://stylish-dawn-film.solana-mainnet.quiknode.pro/')

      const recipientPubKey = new PublicKey("")
      const amount = 0.01 * LAMPORTS_PER_SOL

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubKey,
          lamports: amount,
        })
      )

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      const signature = await sendTransaction(transaction, connection)
      console.log('Transaction sent:', signature)

      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      })

      console.log('Transaction confirmed:', confirmation)

      const response = await fetch('/api/v1/actions/generate-blink/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label,
          description,
          wallet: publicKey.toString(),
          mint,
          commission: takeCommission,
          percentage: percentage,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate blink')
      }

      const data = await response.json()
      setBlinkLink(data.blinkLink)
      setShowForm(false)
      if (form.current) {
        form.current.style.padding = '70px'
      }

      toast({
        title: "Blink generated",
        description: "Your Blink has been successfully generated",
      })
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      toast({
        title: "Error",
        description: "There was an issue generating your blink. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = async () => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    if (!label || !description || !mint) {
      toast({
        title: "Incomplete form",
        description: "Please fill all fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setLoadingText('Generating Blink Preview!')

    try {
      const response = await fetch('/api/v1/actions/generate-blink/token?mint=' + mint)

      if (!response.ok) {
        throw new Error('Failed to generate blink')
      }

      const data = await response.json()
      setShowPreview(false)
      setIcon(data.icon)
      setTitle(data.title)
    } catch (err) {
      console.error(err)
      toast({
        title: "Error",
        description: "Invalid Mint Address!",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://dial.to/?action=solana-action:${blinkLink}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1000)
    toast({
      title: "Copied",
      description: "Blink link copied to clipboard",
    })
  }

  const handleTweet = () => {
    const tweetText = `Check out this Blink I just made @getblinkdotfun: https://dial.to/?action=solana-action:${blinkLink}`
    const twitterUrl = `https://X.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
    window.open(twitterUrl, '_blank')
  }

  const handleNew = () => {
    setShowForm(true)
    if (form.current) {
      form.current.style.padding = '120px'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {loading && <LoadingScreen subtext={loadingText} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Customize Your Blink</CardTitle>
            <CardDescription>Create and customize your Blink token</CardDescription>
          </CardHeader>
          <CardContent>
            {showForm && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mint">Mint Address</Label>
                  <Input
                    id="mint"
                    value={mint}
                    onChange={(e) => setMint(e.target.value)}
                    placeholder="Mint Address"
                    maxLength={45}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Label"
                    maxLength={30}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Take commission</Label>
                  <RadioGroup value={takeCommission} onValueChange={setTakeCommission}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="yes" />
                      <Label htmlFor="yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="no" />
                      <Label htmlFor="no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                {takeCommission === "yes" && (
                  <div className="space-y-2">
                    <Label htmlFor="percentage">Commission Percentage</Label>
                    <Input
                      id="percentage"
                      type="number"
                      value={percentage}
                      onChange={(e) => setPercentage(Math.min(1, parseFloat(e.target.value) || 0))}
                      placeholder="Commission Percentage"
                      max={1}
                      min={0}
                      step={0.01}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description"
                    maxLength={143}
                  />
                </div>
              </div>
            )}
            {blinkLink && !showForm && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Your Blink Link:</h2>
                <div className="p-2 bg-secondary rounded">
                  <a href={`https://dial.to/?action=solana-action:${blinkLink}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    https://dial.to/?action=solana-action:{blinkLink}
                  </a>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleCopy}>{copied ? "Copied!" : "Copy"}</Button>
                  <Button onClick={handleTweet}>Tweet</Button>
                  <Button onClick={handleNew}>Create New</Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {showForm && publicKey ? (
              <Button onClick={showPreview ? handlePreview : handleSubmit} disabled={!connected}>
                {showPreview ? 'Preview Blink' : 'Generate Blink'}
              </Button>
            ) : (
              showForm && <WalletButton />
            )}
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Blink Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <Preview
              icon={icon || 'https://ucarecdn.com/7b8bfa84-f61c-4b13-9d81-68b1cfa9a9b2/miltoncard1.svg'}
              label={label || 'Your Label'}
              description={description || 'Your Description shows up here, Keep it short and simple'}
              title={title || "Your Title : )"}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}