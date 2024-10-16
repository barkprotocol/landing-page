import { useState, useRef, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '@/components/ui/wallet-button';
import Preview from "@/components/preview/page";
import {
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Connection
} from '@solana/web3.js';
import LoadingScreen from '@/components/ui/loading';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function TokenPage() {
  const { publicKey, connected, sendTransaction } = useWallet();
  const [icon, setIcon] = useState<string>('');
  const [label, setLabel] = useState<string>('');
  const [percentage, setPercentage] = useState<number>(0);
  const [takeCommission, setTakeCommission] = useState<string>("no");
  const [description, setDescription] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [mint, setMint] = useState<string>('');
  const [showPreview, setShowPreview] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Please Wait!');
  const [showForm, setShowForm] = useState(true);
  const [blinkLink, setBlinkLink] = useState('');
  const [copied, setCopied] = useState(false);
  const form = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setShowPreview(true);
  }, [mint]);

  useEffect(() => {
    if (takeCommission === "no") {
      setPercentage(0);
    }
  }, [takeCommission]);

  const isValidMintAddress = (address: string) => {
    try {
      new PublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!label || !description || !mint) {
      toast({
        title: "Incomplete form",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    if (!isValidMintAddress(mint)) {
      toast({
        title: "Invalid Mint Address",
        description: "Please provide a valid mint address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setLoadingText('Waiting for Transaction confirmation!');

    try {
      const connection = new Connection('https://stylish-dawn-film.solana-mainnet.quiknode.pro/');

      const recipientPubKey = new PublicKey(""); // Set this to the recipient's public key
      const amount = 0.01 * LAMPORTS_PER_SOL;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubKey,
          lamports: amount,
        })
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      console.log('Transaction sent:', signature);

      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      });

      console.log('Transaction confirmed:', confirmation);

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
      });

      if (!response.ok) {
        throw new Error('Failed to generate blink');
      }

      const data = await response.json();
      setBlinkLink(data.blinkLink);
      setShowForm(false);
      if (form.current) {
        form.current.style.padding = '70px';
      }

      toast({
        title: "Blink generated",
        description: "Your Blink has been successfully generated",
      });
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast({
        title: "Error",
        description: "There was an issue generating your blink. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!label || !description || !mint) {
      toast({
        title: "Incomplete form",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setLoadingText('Generating Blink Preview!');

    try {
      const response = await fetch('/api/v1/actions/generate-blink/token?mint=' + mint);

      if (!response.ok) {
        throw new Error('Failed to generate blink');
      }

      const data = await response.json();
      setShowPreview(false);
      setIcon(data.icon);
      setTitle(data.title);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Invalid Mint Address!",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://dial.to/?action=solana-action:${blinkLink}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
    toast({
      title: "Copied",
      description: "Blink link copied to clipboard",
    });
  };

  const handleTweet = () => {
    const tweetText = `Check out this Blink I just made @miltonprotocol: https://dial.to/?action=solana-action:${blinkLink}`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, "_blank");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Your Blink Token</h1>
      <Card>
        <CardHeader>
          <CardTitle>Create your token</CardTitle>
          <CardDescription>Fill in the details to create your Blink token.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <LoadingScreen message={loadingText} />}
          {showForm && (
            <div ref={form}>
              <Label htmlFor="mint">Mint Address</Label>
              <Input id="mint" value={mint} onChange={(e) => setMint(e.target.value)} placeholder="Enter mint address" />
              
              <Label htmlFor="label">Token Label</Label>
              <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Enter token label" />
              
              <Label htmlFor="description">Token Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter token description" />
              
              <Label htmlFor="commission">Take Commission?</Label>
              <RadioGroup onValueChange={setTakeCommission} defaultValue="no">
                <RadioGroupItem value="yes" id="yes" label="Yes" />
                <RadioGroupItem value="no" id="no" label="No" />
              </RadioGroup>

              {takeCommission === "yes" && (
                <>
                  <Label htmlFor="percentage">Commission Percentage</Label>
                  <Input id="percentage" type="number" value={percentage} onChange={(e) => setPercentage(Number(e.target.value))} placeholder="Enter commission percentage" />
                </>
              )}

              <Button onClick={handleSubmit} className="mt-4">Generate Blink Token</Button>
              <Button onClick={handlePreview} className="mt-4">Preview Blink Token</Button>
            </div>
          )}
          {showPreview && <Preview icon={icon} title={title} />}
        </CardContent>
        <CardFooter>
          <WalletButton />
        </CardFooter>
      </Card>
    </div>
  );
}
