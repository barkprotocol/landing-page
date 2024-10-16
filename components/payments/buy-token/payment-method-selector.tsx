import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Check } from 'lucide-react'
import Image from 'next/image'

type PaymentMethod = 'SOL' | 'USDC';

interface PaymentCard {
  id: PaymentMethod;
  name: string;
  icon: string;
  description: string;
}

// Array of payment method cards with their details
const paymentCards: PaymentCard[] = [
  {
    id: 'SOL',
    name: 'Solana',
    icon: 'https://ucarecdn.com/8bcc4664-01b2-4a88-85bc-9ebce234f08b/sol.png', 
    description: 'Pay with SOL, the native currency of the Solana blockchain.',
  },
  {
    id: 'USDC',
    name: 'USD Coin',
    icon: 'https://ucarecdn.com/67e17a97-f3bd-46c0-8627-e13b8b939d26/usdc.png',
    description: 'Pay with USDC, a stable coin pegged to the US Dollar.',
  },
];

interface PaymentMethodSelectorProps {
  paymentMethod: PaymentMethod; // Currently selected payment method
  setPaymentMethod: (method: PaymentMethod) => void; // Function to update the selected payment method
}

export default function PaymentMethodSelector({ paymentMethod, setPaymentMethod }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Select Payment Method</Label>
      <div className="grid grid-cols-2 gap-4">
        {paymentCards.map((card) => (
          <Card
            key={card.id}
            className={`cursor-pointer transition-all ${
              paymentMethod === card.id
                ? 'border-primary shadow-md' // Highlight the selected card
                : 'border-gray-200 hover:border-primary/50'
            }`}
            onClick={() => setPaymentMethod(card.id)} // Update the selected payment method
          >
            <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
              <Image
                src={card.icon}
                alt={`${card.name} logo`}
                width={40}
                height={40}
                className="mb-2"
              />
              <h3 className="font-semibold text-sm">{card.name}</h3>
              {/* Show checkmark for selected method */}
              {paymentMethod === card.id && (
                <Check className="text-primary h-4 w-4" />
              )}
              {/* Optional: Show description */}
              <p className="text-xs text-gray-500">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
