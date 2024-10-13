"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { ChartContainer, ChartTooltip, ChartLegend } from '@/components/ui/chart'

const data = [
  { name: '50', value: 50, color: '#f9fafb' },
  { name: '100', value: 100, color: '#f3f4f6' },
  { name: '200', value: 200, color: '#e5e7eb' },
  { name: '300', value: 300, color: '#d1d5db' },
  { name: '400', value: 400, color: '#9ca3af' },
  { name: '500', value: 500, color: '#6b7280' },
  { name: '600', value: 600, color: '#4b5563' },
  { name: '700', value: 700, color: '#374151' },
  { name: '800', value: 800, color: '#1f2937' },
  { name: '900', value: 900, color: '#111827' },
  { name: '950', value: 950, color: '#030712' },
  { name: 'Navajo White', value: 100, color: '#ffc272' },
  { name: '#FFDAA4', value: 100, color: '#FFDAA4' },
  { name: 'Butter Milk', value: 100, color: '#FFECB1' },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value, color } = payload[0].payload
    return (
      <div className="bg-background border border-border p-2 rounded-lg shadow-md">
        <p className="font-semibold">{name}</p>
        <p>Value: {value}</p>
        <div className="flex items-center mt-1">
          <div className="w-4 h-4 mr-2" style={{ backgroundColor: color }}></div>
          <span>{color}</span>
        </div>
      </div>
    )
  }
  return null
}

export function ColorDistributionPieChart() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Color Distribution</CardTitle>
        <CardDescription>Gray and Additional Colors Pie Chart</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            colorDistribution: {
              label: "Color Distribution",
            },
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<CustomTooltip />} />
              <ChartLegend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}