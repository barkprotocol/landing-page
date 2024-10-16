import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, Copy, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function WalletComponent() {
  const [address, setAddress] = useState('Milton123....234'); // Fetch or set dynamic address
  const [privateKey, setPrivateKey] = useState('YOUR_PRIVATE_KEY'); // Fetch or set dynamic private key
  const [copied, setCopied] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false); // State to toggle private key visibility
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
      .then(() => {
        setCopied(true);
        toast({
          title: "Address Copied",
          description: "Wallet address has been copied to clipboard.",
        });
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(() => {
        toast({
          title: "Copy Failed",
          description: "Unable to copy address to clipboard.",
        });
      });
  };

  const togglePrivateKeyVisibility = () => {
    setShowPrivateKey(!showPrivateKey);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Your Wallet</CardTitle>
        <CardDescription>Manage your MILTON wallet</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="address" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="privateKey">Private Key</TabsTrigger>
          </TabsList>
          <TabsContent value="address">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Wallet className="h-4 w-4" />
                <Label htmlFor="address">Wallet Address</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Input id="address" value={address} readOnly />
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="privateKey">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Wallet className="h-4 w-4" />
                <Label htmlFor="privateKey">Private Key</Label>
                <Button variant="outline" size="icon" onClick={togglePrivateKeyVisibility}>
                  {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Input
                id="privateKey"
                type={showPrivateKey ? 'text' : 'password'}
                value={showPrivateKey ? privateKey : '************************'}
                readOnly
              />
              <p className="text-sm text-muted-foreground">Never share your private key with anyone.</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
