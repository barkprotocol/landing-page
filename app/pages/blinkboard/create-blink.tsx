import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { blinkTypes } from './blinkboard-utils';

export const CreateBlink = ({ onCreateBlink }) => {
  const [blinkType, setBlinkType] = useState<string>('donation');
  const [amount, setAmount] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCreateBlink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onCreateBlink(blinkType, parseFloat(amount), recipient, memo);
    } catch (error) {
      console.error("Error creating blink:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white text-gray-800 mt-6">
      <CardHeader>
        <CardTitle>Create a Blink</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateBlink} className="space-y-4">
          <div>
            <Label htmlFor="blinkType">Blink Type</Label>
            <Select value={blinkType} onValueChange={setBlinkType}>
              <SelectTrigger id="blinkType">
                <SelectValue placeholder="Select Blink Type" />
              </SelectTrigger>
              <SelectContent>
                {blinkTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div>
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Solana address"
              required
            />
          </div>
          <div>
            <Label htmlFor="memo">Memo (Optional)</Label>
            <Textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Add a message or note"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Blink..." : "Create Blink"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};