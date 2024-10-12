import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from 'lucide-react'

const SubscriptionPlans = () => {
  const plans = [
    {
      name: "Starter",
      price: "$9.99",
      features: [
        "100 Blinks per month",
        "Basic analytics",
        "Email support",
        "1 user"
      ],
      isCurrent: true
    },
    {
      name: "Pro",
      price: "$29.99",
      features: [
        "Unlimited Blinks",
        "Advanced analytics",
        "Priority support",
        "5 users"
      ],
      isCurrent: false
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: [
        "Unlimited Blinks",
        "Custom analytics",
        "24/7 dedicated support",
        "Unlimited users"
      ],
      isCurrent: false
    }
  ]

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {plans.map((plan) => (
        <Card key={plan.name} className={`flex flex-col ${plan.isCurrent ? "border-primary shadow-lg" : ""}`}>
          <CardHeader className="text-center">
            {plan.isCurrent && (
              <Badge className="absolute top-4 right-4" variant="secondary">
                Current Plan
              </Badge>
            )}
            <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
            <CardDescription>
              <span className="text-4xl font-bold">{plan.price}</span>
              {plan.name !== "Enterprise" && <span className="text-sm">/ month</span>}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant={plan.isCurrent ? "outline" : "default"}>
              {plan.isCurrent ? "Current Plan" : "Upgrade"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export default SubscriptionPlans