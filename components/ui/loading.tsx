import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingScreenProps {
  subtext?: string
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ subtext = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        <p className="mt-4 text-lg font-medium text-foreground">{subtext}</p>
      </div>
    </div>
  )
}

export default LoadingScreen