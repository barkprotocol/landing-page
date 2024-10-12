'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Check, X } from 'lucide-react'

const pricingPlans = [
  {
    name: "Basic",
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
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Pricing Plans
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Choose the perfect plan for your blockchain needs
          </p>
        </div>

        <div className="mt-12 flex justify-center">
          <div className="relative self-center rounded-full p-1 bg-gray-200 flex">
            <button
              className={`${
                !isYearly ? 'bg-white text-gray-900' : 'bg-transparent text-gray-500'
              } relative w-1/2 rounded-full py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10 sm:w-auto sm:px-8`}
              onClick={() => setIsYearly(false)}
            >
              Monthly billing
            </button>
            <button
              className={`${
                isYearly ? 'bg-white text-gray-900' : 'bg-transparent text-gray-500'
              } relative w-1/2 rounded-full py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10 sm:w-auto sm:px-8`}
              onClick={() => setIsYearly(true)}
            >
              Yearly billing
            </button>
          </div>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {pricingPlans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="flex flex-col h-full">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-4xl font-extrabold">
                      ${isYearly ? plan.yearlyPrice.toFixed(2) : plan.monthlyPrice.toFixed(2)}
                    </span>
                    <span className="text-base font-medium text-gray-500">
                      {isYearly ? '/year' : '/month'}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="h-6 w-6 flex-shrink-0 text-green-500" />
                        <span className="ml-3 text-base text-gray-700">{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <X className="h-6 w-6 flex-shrink-0 text-red-500" />
                        <span className="ml-3 text-base text-gray-500">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant={plan.name === "Pro" ? "default" : "outline"}>
                    {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}