import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWallet } from '@solana/wallet-adapter-react';
import { useToast } from '@/components/ui/use-toast';
import { createPaymentRequest } from '@/app/solana/pay';
import { PublicKey } from '@solana/web3.js';

interface PaymentFormProps {
  recipientAddress: string; // Address of the recipient
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ recipientAddress }) => {
  const { publicKey } = useWallet();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!publicKey) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to proceed.',
        variant: 'destructive',
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount to pay.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const recipient = new PublicKey(recipientAddress);
      const paymentRequest = await createPaymentRequest(recipient, parseFloat(amount));
      
      // Encode payment URI here (if needed)
      const paymentURI = encodePaymentURI(paymentRequest);
      
      // Here you would initiate the payment using the URI
      // For demonstration, we will log the URI
      console.log('Payment URI:', paymentURI);

      toast({
        title: 'Payment request created',
        description: 'Your payment request has been created successfully.',
      });
    } catch (error) {
      console.error('Error creating payment request:', error);
      toast({
        title: 'Transaction failed',
        description: 'There was an error processing your payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (SOL)</Label>
        <Input
          id="amount"
          type="number"
          placeholder="Enter amount in SOL"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Processing...' : 'Pay'}
      </Button>
    </form>
  );
};
