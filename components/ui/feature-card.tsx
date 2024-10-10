'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  isHovered: boolean
  isSelected: boolean
}

export function FeatureCard({ icon, title, description, isHovered, isSelected }: FeatureCardProps) {
  return (
    <Card 
      className={`h-full transition-all duration-300 ${
        isHovered ? 'shadow-lg scale-105' : ''
      } ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
    >
      <CardHeader>
        <div className="flex items-center space-x-2">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  )
}