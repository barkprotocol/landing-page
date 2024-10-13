import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction, SystemProgram, Keypair } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Component() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [tokenDecimals, setTokenDecimals] = useState(9)
  const [tokenMint, setTokenMint] = useState<PublicKey | null>(null)
  const [error, setError] = useState<string | null>(null)

  const createTestToken = async () => {
    if (!publicKey) {
      setError("Wallet not connected")
      return
    }

    try {
      const mintAccount = Keypair.generate()
      const transaction = new Transaction()

      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintAccount.publicKey,
          space: Token.MINT_SIZE,
          lamports: await Token.getMinBalanceRentForExemptMint(connection),
          programId: TOKEN_PROGRAM_ID,
        })
      )

      transaction.add(
        Token.createInitMintInstruction(
          TOKEN_PROGRAM_ID,
          mintAccount.publicKey,
          tokenDecimals,
          publicKey,
          publicKey
        )
      )

      const signature = await sendTransaction(transaction, connection, {
        signers: [mintAccount],
      })

      await connection.confirmTransaction(signature, 'confirmed')

      setTokenMint(mintAccount.publicKey)
      setError(null)
    } catch (err) {
      setError(`Failed to create token: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Create Test Token</h1>
      <div>
        <Label htmlFor="tokenName">Token Name</Label>
        <Input
          id="tokenName"
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
          placeholder="Test Token"
        />
      </div>
      <div>
        <Label htmlFor="tokenSymbol">Token Symbol</Label>
        <Input
          id="tokenSymbol"
          value={tokenSymbol}
          onChange={(e) => setTokenSymbol(e.target.value)}
          placeholder="TEST"
        />
      </div>
      <div>
        <Label htmlFor="tokenDecimals">Token Decimals</Label>
        <Input
          id="tokenDecimals"
          type="number"
          value={tokenDecimals}
          onChange={(e) => setTokenDecimals(Number(e.target.value))}
        />
      </div>
      <Button onClick={createTestToken}>Create Token</Button>
      {tokenMint && (
        <Alert>
          <AlertTitle>Token Created</AlertTitle>
          <AlertDescription>
            Token Mint Address: {tokenMint.toBase58()}
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}