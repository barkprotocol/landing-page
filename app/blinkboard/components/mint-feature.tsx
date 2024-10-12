'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Printer, Download, Eye, Upload } from 'lucide-react'
import { Connection, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js'
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Metaplex } from '@metaplex-foundation/js'
import { create } from 'ipfs-http-client'

// Initialize IPFS client
const ipfs = create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

const MintFeature = () => {
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [tokenSupply, setTokenSupply] = useState('')
  const [tokenType, setTokenType] = useState('SPL')
  const [currentMintSupply, setCurrentMintSupply] = useState('0')
  const [isNFT, setIsNFT] = useState(false)
  const [nftMetadata, setNftMetadata] = useState('')
  const [royaltyPercentage, setRoyaltyPercentage] = useState('0')
  const [nftType, setNftType] = useState('Image')
  const [previewImage, setPreviewImage] = useState('')
  const [decimals, setDecimals] = useState('9')
  const [ipfsHash, setIpfsHash] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // In a real application, you would connect to the user's wallet here
    // const wallet = useWallet();
    // if (!wallet.connected) {
    //   throw new Error('Please connect your wallet');
    // }

    const connection = new Connection('https://api.devnet.solana.com', 'confirmed')
    // const payer = wallet.publicKey

    try {
      if (isNFT) {
        await mintNFT(connection)
      } else {
        await mintToken(connection)
      }
      console.log('Minting successful!')
    } catch (error) {
      console.error('Error minting:', error)
    }
  }

  const mintToken = async (connection: Connection) => {
    // This is a simplified version. In a real app, you'd use the connected wallet.
    const payer = PublicKey.unique()
    const mintAuthority = payer
    const freezeAuthority = payer

    const tokenMint = await Token.createMint(
      connection,
      payer,
      mintAuthority,
      freezeAuthority,
      parseInt(decimals),
      TOKEN_PROGRAM_ID
    )

    console.log(`Token minted: ${tokenMint.publicKey.toBase58()}`)

    // Create token account
    const tokenAccount = await tokenMint.createAccount(payer)

    // Mint tokens to the account
    await tokenMint.mintTo(
      tokenAccount,
      mintAuthority,
      [],
      parseInt(tokenSupply)
    )

    console.log(`Minted ${tokenSupply} tokens to ${tokenAccount.toBase58()}`)
  }

  const mintNFT = async (connection: Connection) => {
    const metaplex = new Metaplex(connection)
    // In a real app, you'd use the connected wallet
    // metaplex.use(walletAdapterIdentity(wallet))

    // Ensure metadata is uploaded to IPFS
    if (!ipfsHash) {
      throw new Error('Please upload metadata to IPFS first')
    }

    const { nft } = await metaplex.nfts().create({
      uri: `ipfs://${ipfsHash}`,
      name: tokenName,
      sellerFeeBasisPoints: parseInt(royaltyPercentage) * 100,
    })

    console.log(`NFT minted: ${nft.address.toBase58()}`)
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setPreviewImage(e.target?.result as string)
      reader.readAsDataURL(file)

      // Upload image to IPFS
      try {
        setIsUploading(true)
        const added = await ipfs.add(file)
        const imageIpfsHash = added.cid.toString()
        console.log('Image uploaded to IPFS:', imageIpfsHash)

        // Update metadata with IPFS image hash
        const updatedMetadata = JSON.parse(nftMetadata || '{}')
        updatedMetadata.image = `ipfs://${imageIpfsHash}`
        setNftMetadata(JSON.stringify(updatedMetadata, null, 2))

        // Upload updated metadata to IPFS
        const metadataAdded = await ipfs.add(JSON.stringify(updatedMetadata))
        setIpfsHash(metadataAdded.cid.toString())
        console.log('Metadata uploaded to IPFS:', metadataAdded.cid.toString())
      } catch (error) {
        console.error('Error uploading to IPFS:', error)
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = previewImage
    link.download = 'preview-image.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Mint Tokens or NFTs</CardTitle>
        <CardDescription>Create your own tokens or NFTs on the Solana blockchain</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleMint} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tokenName">Token/NFT Name</Label>
            <Input
              id="tokenName"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              placeholder="My Awesome Token"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tokenSymbol">Token Symbol</Label>
            <Input
              id="tokenSymbol"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              placeholder="MAT"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tokenType">Token Type</Label>
            <Select value={tokenType} onValueChange={setTokenType}>
              <SelectTrigger>
                <SelectValue placeholder="Select token type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SPL">Solana Program Library (SPL)</SelectItem>
                <SelectItem value="Solana">Solana Native</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tokenSupply">Total Supply</Label>
            <Input
              id="tokenSupply"
              type="number"
              value={tokenSupply}
              onChange={(e) => setTokenSupply(e.target.value)}
              placeholder="1000000"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentMintSupply">Current Mint Supply</Label>
            <Input
              id="currentMintSupply"
              type="number"
              value={currentMintSupply}
              onChange={(e) => setCurrentMintSupply(e.target.value)}
              placeholder="0"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="decimals">Decimals</Label>
            <Input
              id="decimals"
              type="number"
              value={decimals}
              onChange={(e) => setDecimals(e.target.value)}
              placeholder="9"
              min="0"
              max="9"
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isNFT"
              checked={isNFT}
              onCheckedChange={(checked) => {
                setIsNFT(checked)
                if (checked) {
                  setDecimals('0')
                } else {
                  setDecimals('9')
                }
              }}
            />
            <Label htmlFor="isNFT">Mint as NFT</Label>
          </div>
          {isNFT && (
            <>
              <div className="space-y-2">
                <Label htmlFor="nftType">NFT Type</Label>
                <Select value={nftType} onValueChange={setNftType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select NFT type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Image">Image</SelectItem>
                    <SelectItem value="Video">Video</SelectItem>
                    <SelectItem value="Audio">Audio</SelectItem>
                    <SelectItem value="3D">3D Model</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nftMetadata">NFT Metadata (JSON)</Label>
                <Textarea
                  id="nftMetadata"
                  value={nftMetadata}
                  onChange={(e) => setNftMetadata(e.target.value)}
                  placeholder='{"name": "My NFT", "description": "A unique digital asset", "image": "ipfs://..."}'
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="royaltyPercentage">Royalty Percentage</Label>
                <Slider
                  id="royaltyPercentage"
                  min={0}
                  max={100}
                  step={1}
                  value={[parseInt(royaltyPercentage)]}
                  onValueChange={(value) => setRoyaltyPercentage(value[0].toString())}
                />
                <div className="text-sm text-muted-foreground">{royaltyPercentage}%</div>
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="previewImage">Preview Image</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="previewImage"
                type="file"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
              />
              <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload Image'}
                <Upload className="ml-2 h-4 w-4" />
              </Button>
              {previewImage && (
                <Button type="button" variant="outline" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              )}
            </div>
          </div>
          {previewImage && (
            <div className="mt-4">
              <Label>Preview</Label>
              <div className="mt-2 border rounded-lg overflow-hidden">
                <img src={previewImage} alt="Preview" className="max-w-full h-auto" />
              </div>
            </div>
          )}
          {ipfsHash && (
            <div className="mt-4">
              <Label>IPFS Hash (Metadata)</Label>
              <div className="mt-2 p-2 bg-muted rounded-lg break-all">
                <code>{ipfsHash}</code>
              </div>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isNFT && !ipfsHash}>
            Mint Token/NFT <Printer className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default MintFeature