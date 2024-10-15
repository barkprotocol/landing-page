import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconType } from 'lucide-react'

interface BlockchainServiceCardProps {
  title: string
  description: string
  icon: IconType
  onAction: () => void
  actionText: string
  disabled?: boolean
}

export function BlockchainServiceCard({
  title,
  description,
  icon: Icon,
  onAction,
  actionText,
  disabled = false
}: BlockchainServiceCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Icon className="w-6 h-6" />
          <span>{title}</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Add any additional content here if needed */}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onAction} 
          disabled={disabled} 
          className="w-full"
        >
          {actionText}
        </Button>
      </CardFooter>
    </Card>
  )
}