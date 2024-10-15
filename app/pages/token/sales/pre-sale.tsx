import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const PreSale = () => {
  const router = useRouter();
  const { toast } = useToast();
  
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // State to hold dynamic token details (if needed)
  const [tokenDetails, setTokenDetails] = useState({
    name: "MILTOn",
    symbol: "MILTON",
    price: 0.0000001, // Price in SOL
    startDate: new Date("2024-11-20T12:00:00Z"),
    endDate: new Date("2024-11-27T12:00:00Z"),
  });

  useEffect(() => {
    // Fetch token details from an API if necessary
    // const fetchTokenDetails = async () => {
    //   const response = await fetch('/api/token-details');
    //   const data = await response.json();
    //   setTokenDetails(data);
    // };
    // fetchTokenDetails();
  }, []);

  const handlePurchase = async () => {
    setIsLoading(true);
    
    try {
      // Replace with your blockchain service logic to handle token purchase
      // Example: await BlockchainServices.purchaseTokens(quantity);
      
      // Simulate a successful purchase for demonstration purposes
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulating async operation

      toast({
        title: "Purchase Successful!",
        description: `You have purchased ${quantity} ${tokenDetails.symbol} tokens.`,
      });

      // Optionally redirect after purchase
      router.push('/token/sales/success');
      
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: error.message || "An error occurred during the purchase.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isSaleActive = () => {
    const now = new Date();
    return now >= tokenDetails.startDate && now <= tokenDetails.endDate;
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Number(e.target.value)); // Ensure quantity is at least 1
    setQuantity(value);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>{tokenDetails.name}</CardTitle>
          <CardDescription>
            {tokenDetails.symbol} Pre-Sale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Token Price: {tokenDetails.price} SOL</h3>
            <p>Sale Start: {tokenDetails.startDate.toLocaleString()}</p>
            <p>Sale End: {tokenDetails.endDate.toLocaleString()}</p>
            <p className={`text-sm ${isSaleActive() ? 'text-green-500' : 'text-red-500'}`}>
              {isSaleActive() ? 'Sale is Active!' : 'Sale is Inactive'}
            </p>
          </div>
          {isSaleActive() && (
            <div>
              <div className="flex flex-col space-y-1.5 mb-4">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                  aria-label="Quantity of tokens to purchase"
                />
              </div>
              <Button onClick={handlePurchase} disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Purchase Tokens'}
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PreSale;
