'use client'

import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface MarketPricesProps {
  prices: Record<string, { price: number; change: number }>
  isDarkMode: boolean
}

export function MarketPrices({ prices, isDarkMode }: MarketPricesProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Object.entries(prices).map(([token, { price, change }], index) => (
        <motion.div
          key={token}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} hover:shadow-lg transition-shadow duration-300`}>
            <CardContent className="flex flex-col p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{token}</h3>
                <div className={`flex items-center ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {change >= 0 ? (
                    <ArrowUpIcon className="w-4 h-4 mr-1" aria-hidden="true" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 mr-1" aria-hidden="true" />
                  )}
                  <span className="font-medium">{Math.abs(change).toFixed(2)}%</span>
                </div>
              </div>
              <p className="text-2xl font-bold" aria-label={`${token} price: $${price.toFixed(2)}`}>
                ${price.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                24h change: {change >= 0 ? '+' : ''}{change.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}