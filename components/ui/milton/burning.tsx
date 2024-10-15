import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const Burning = () => {
  const { toast } = useToast();

  const [amount, setAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleBurn = async () => {
    setIsLoading(true);

    try {
      // Replace with your actual API call or blockchain interaction to burn tokens
      // Example: await BlockchainServices.burnTokens(amount);

      toast({
        title: "Tokens Burned!",
        description: `${amount} tokens have been successfully burned.`,
      });
      
      // Optionally reset the amount after burning
      setAmount(0);
      
    } catch (error) {
      toast({
        title: "Burning Failed",
        description: error.message || "An error occurred during the burning process.",
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
          <CardTitle>Token Burning</CardTitle>
          <CardDescription>Burn your tokens to reduce supply.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="amount">Amount to Burn</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
          </div>
          <Button onClick={handleBurn} disabled={isLoading}>
            {isLoading ? 'Burning...' : 'Burn Tokens'}
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

export default Burning;
