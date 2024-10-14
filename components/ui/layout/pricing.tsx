'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Check, X, Zap } from 'lucide-react'

const pricingPlans = [
  {
    name: "Basic",
    description: "Perfect for getting started",
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    features: [
      "100 Blinks per month",
      "Basic analytics",
      "Email support",
      "1 user",
      "API access",
    ],
    notIncluded: [
      "Advanced analytics",
      "Priority support",
      "Multiple users",
      "Custom integrations",
    ]
  },
  {
    name: "Pro",
    description: "Best for growing teams",
    monthlyPrice: 29.99,
    yearlyPrice: 299.99,
    features: [
      "Unlimited Blinks",
      "Advanced analytics",
      "Priority support",
      "5 users",
      "API access",
      "Custom integrations",
    ],
    notIncluded: [
      "24/7 phone support",
      "Dedicated account manager",
    ]
  },
  {
    name: "Enterprise",
    description: "For large-scale operations",
    monthlyPrice: 99.99,
    yearlyPrice: 999.99,
    features: [
      "Unlimited Blinks",
      "Advanced analytics",
      "24/7 phone support",
      "Unlimited users",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
      "Custom feature development",
    ],
    notIncluded: []
  }
]

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center">
          <Badge variant="secondary" className="mb-4">Pricing</Badge>
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl mb-4">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
            Select the perfect plan to power your blockchain journey with Blinkboard
          </p>
        </div>

        <div className="mt-12 flex justify-center items-center space-x-4">
          <Label htmlFor="billing-toggle" className="text-sm font-medium text-muted-foreground">Monthly</Label>
          <Switch
            id="billing-toggle"
            checked={isYearly}
            onCheckedChange={setIsYearly}
          />
          <Label htmlFor="billing-toggle" className="text-sm font-medium text-muted-foreground">
            Yearly
            <Badge variant="secondary" className="ml-2">Save 20%</Badge>
          </Label>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className={`flex flex-col h-full ${plan.name === "Pro" ? "border-primary shadow-lg" : ""}`}>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center justify-between">
                    {plan.name}
                    {plan.name === "Pro" && (
                      <Badge variant="secondary" className="ml-2">
                        Recommended
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold">
                      ${isYearly ? plan.yearlyPrice.toFixed(2) : plan.monthlyPrice.toFixed(2)}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      {isYearly ? '/year' : '/month'}
                    </span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <Check className="h-5 w-5 flex-shrink-0 text-green-500 mr-3" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.notIncluded.length > 0 && (
                    <>
                      <div className="text-sm font-medium text-muted-foreground mb-2">Not included:</div>
                      <ul className="space-y-3">
                        {plan.notIncluded.map((feature) => (
                          <li key={feature} className="flex items-center">
                            <X className="h-5 w-5 flex-shrink-0 text-red-500 mr-3" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={plan.name === "Pro" ? "default" : "outline"}
                    size="lg"
                  >
                    {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                    {plan.name === "Pro" && <Zap className="ml-2 h-4 w-4" />}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-base text-muted-foreground">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  )
}