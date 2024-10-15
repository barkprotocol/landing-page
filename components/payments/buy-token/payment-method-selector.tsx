import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Check } from 'lucide-react'
import Image from 'next/image'

type PaymentMethod = 'SOL' | 'USDC'

interface PaymentCard {
  id: PaymentMethod
  name: string
  icon: string
  description: string
}

const paymentCards: PaymentCard[] = [
  {
    id: 'SOL',
    name: 'Solana',
    icon: '/solana-logo.png',
    description: 'Pay with SOL, the native currency of the Solana blockchain.'
  },
  {
    id: 'USDC',
    name: 'USD Coin',
    icon: '/usdc-logo.png',
    description: 'Pay with USDC, a stable coin pegged to the US Dollar.'
  }
]

interface PaymentMethodSelectorProps {
  paymentMethod: PaymentMethod
  setPaymentMethod: (method: PaymentMethod) => void
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
                ? 'border-primary shadow-md'
                : 'border-gray-200 hover:border-primary/50'
            }`}
            onClick={() => setPaymentMethod(card.id)}
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
              {paymentMethod === card.id && (
                <Check className="text-primary h-4 w-4" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}