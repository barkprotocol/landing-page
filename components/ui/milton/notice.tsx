import React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'

interface NoticeProps {
  title: string
  description: string
}

export function Notice({ title, description }: NoticeProps) {
  return (
    <Alert className="mb-8">
      <Info className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  )
}