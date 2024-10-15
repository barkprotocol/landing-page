import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const Liquidity = () => {
  const { toast } = useToast();

  const [amount, setAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleProvideLiquidity = async () => {
    setIsLoading(true);

    try {
      // Replace with your actual API call or blockchain interaction to provide liquidity
      // Example: await BlockchainServices.provideLiquidity(amount);

      toast({
        title: "Liquidity Provided!",
        description: `${amount} tokens have been successfully added as liquidity.`,
      });

      // Optionally reset the amount after providing liquidity
      setAmount(0);
      
    } catch (error) {
      toast({
        title: "Liquidity Provision Failed",
        description: error.message || "An error occurred during the liquidity provision.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Provide Liquidity</CardTitle>
          <CardDescription>Add your tokens to the liquidity pool.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="amount">Amount to Provide</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
          </div>
          <Button onClick={handleProvideLiquidity} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Provide Liquidity'}
          </Button>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => setAmount(0)}>
            Reset
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Liquidity;
