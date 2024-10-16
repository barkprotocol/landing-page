'use client'

import { Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { CurrencyDollar, Sun, Coins } from 'lucide-react'

interface PriceHistoryProps {
  history: Array<{ date: string; SOL: number; USDC: number; MILTON: number }>
  isDarkMode: boolean
}

const SolanaLogo = () => (
  <svg width="16" height="16" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M93.94 42.63H27.38L44.03 24.74H110.62L93.94 42.63Z" fill="url(#paint0_linear)"/>
    <path d="M93.94 103.26H27.38L44.03 85.37H110.62L93.94 103.26Z" fill="url(#paint1_linear)"/>
    <path d="M44.03 72.99H110.62L93.94 90.88H27.38L44.03 72.99Z" fill="url(#paint2_linear)"/>
    <defs>
      <linearGradient id="paint0_linear" x1="69" y1="24.74" x2="69" y2="42.63" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00FFA3"/>
        <stop offset="1" stopColor="#DC1FFF"/>
      </linearGradient>
      <linearGradient id="paint1_linear" x1="69" y1="85.37" x2="69" y2="103.26" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00FFA3"/>
        <stop offset="1" stopColor="#DC1FFF"/>
      </linearGradient>
      <linearGradient id="paint2_linear" x1="69" y1="72.99" x2="69" y2="90.88" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00FFA3"/>
        <stop offset="1" stopColor="#DC1FFF"/>
      </linearGradient>
    </defs>
  </svg>
)

const USDCLogo = () => (
  <svg width="16" height="16" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="128" cy="128" r="128" fill="#2775CA"/>
    <path d="M104.04 137.22C104.04 144.86 110.02 147.46 119.74 147.46C129.46 147.46 135.44 144.86 135.44 137.22V118.78C135.44 111.14 129.46 108.54 119.74 108.54C110.02 108.54 104.04 111.14 104.04 118.78V137.22Z" fill="white"/>
    <path d="M128 26C70.56 26 24 72.56 24 130C24 187.44 70.56 234 128 234C185.44 234 232 187.44 232 130C232 72.56 185.44 26 128 26ZM164.94 149.38C164.94 171.86 147.22 181.58 119.74 181.58C92.26 181.58 74.54 171.86 74.54 149.38V106.62C74.54 84.14 92.26 74.42 119.74 74.42C147.22 74.42 164.94 84.14 164.94 106.62V149.38Z" fill="white"/>
  </svg>
)

const MiltonLogo = () => (
  <svg width="16" height="16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#FFC658"/>
    <path d="M30 70V30H40L50 50L60 30H70V70H60V45L50 65L40 45V70H30Z" fill="white"/>
  </svg>
)

export function PriceHistory({ history, isDarkMode }: PriceHistoryProps) {
  const textColor = isDarkMode ? "#ffffff" : "#374151"
  const backgroundColor = isDarkMode ? "#374151" : "#ffffff"

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={history}>
        <XAxis 
          dataKey="date" 
          stroke={textColor}
          tick={{ fill: textColor }}
        />
        <YAxis 
          stroke={textColor}
          tick={{ fill: textColor }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: backgroundColor,
            border: "none",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
          }}
          labelStyle={{ color: textColor }}
          itemStyle={{ color: textColor }}
        />
        <Legend 
          iconType="circle"
          iconSize={10}
          wrapperStyle={{ paddingTop: "10px" }}
        />
        <Line 
          type="monotone" 
          dataKey="SOL" 
          stroke="#8884d8" 
          name="SOL" 
          dot={false}
          activeDot={{ r: 8 }}
        />
        <Line 
          type="monotone" 
          dataKey="USDC" 
          stroke="#82ca9d" 
          name="USDC" 
          dot={false}
          activeDot={{ r: 8 }}
        />
        <Line 
          type="monotone" 
          dataKey="MILTON" 
          stroke="#ffc658" 
          name="MILTON" 
          dot={false}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function PriceHistoryWithIcons({ history, isDarkMode }: PriceHistoryProps) {
  return (
    <div className="space-y-4">
      <PriceHistory history={history} isDarkMode={isDarkMode} />
      <div className="flex justify-center space-x-4">
        <div className="flex items-center">
          <SolanaLogo />
          <span className="ml-2">SOL</span>
        </div>
        <div className="flex items-center">
          <USDCLogo />
          <span className="ml-2">USDC</span>
        </div>
        <div className="flex items-center">
          <MiltonLogo />
          <span className="ml-2">MILTON</span>
        </div>
      </div>
    </div>
  )
}