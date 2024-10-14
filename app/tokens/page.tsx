import { useState, useRef, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '@/components/ui/wallet-button'
import Preview from "@/components/preview/page"
import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Connection
} from '@solana/web3.js'
import LoadingScreen from '@/components/ui/loading'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface PreviewProps {
  icon: string;
  label: string;
  description: string;
  title: string;
}

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
                    maxLength={100}
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="space-x-2">
            <Button onClick={handleSubmit} disabled={loading}>
              Submit
            </Button>
            <Button variant="secondary" onClick={handlePreview} disabled={loading}>
              Preview
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Preview Your Blink</CardTitle>
          </CardHeader>
          <CardContent>
            {showPreview ? (
              <div>
                {/* You can conditionally show placeholder text here */}
                <p className="text-gray-500">Fill out the form to preview your Blink.</p>
              </div>
            ) : (
              <Preview
                icon={icon || 'https://ucarecdn.com/fe802b60-cb87-4adc-8e1d-1b16a05f9420/miltonlogoicon.svg'}
                label={label || 'Your Label'}
                description={description || 'Your Description shows up here, Keep it short and simple'}
                title={title || "Your Title : )"}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
