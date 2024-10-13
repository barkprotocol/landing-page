import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

const fundsData = [
  { name: 'Product Development', value: 40, color: 'hsl(var(--primary))', description: 'Allocated for ongoing platform development, including new features, security enhancements, and scalability improvements.' },
  { name: 'Marketing & Partnerships', value: 25, color: 'hsl(var(--secondary))', description: 'Dedicated to expanding MILTON\'s reach through strategic marketing campaigns and forming key partnerships in the blockchain and finance sectors.' },
  { name: 'Operations', value: 15, color: 'hsl(var(--accent))', description: 'Covers day-to-day operational costs, including team salaries, office expenses, and legal/compliance requirements.' },
  { name: 'Community Initiatives', value: 10, color: 'hsl(var(--muted))', description: 'Funds allocated for community-driven projects, educational programs, and incentives for active participation in the MILTON ecosystem.' },
  { name: 'Research & Innovation', value: 10, color: 'hsl(var(--warning))', description: 'Investment in cutting-edge blockchain research and innovative technologies to keep MILTON at the forefront of the industry.' },
]

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props
  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)
  const sx = cx + (outerRadius + 10) * cos
  const sy = cy + (outerRadius + 10) * sin
  const mx = cx + (outerRadius + 30) * cos
  const my = cy + (outerRadius + 30) * sin
  const ex = mx + (cos >= 0 ? 1 : -1) * 22
  const ey = my
  const textAnchor = cos >= 0 ? 'start' : 'end'

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-xl font-bold">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="hsl(var(--foreground))">{`${value}%`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  )
}

export function UseOfFunds() {
  const [activeIndex, setActiveIndex] = useState(0)

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Use of Funds</CardTitle>
        <CardDescription>Breakdown of how MILTON will allocate raised funds</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={fundsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                >
                  {fundsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Fund Allocation Details</h3>
            <ScrollArea className="h-[350px] w-full rounded-md border p-4">
              {fundsData.map((item, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{item.name}</h4>
                    <Badge variant="outline" style={{backgroundColor: item.color, color: 'white'}}>
                      {item.value}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Key Points on Fund Utilization</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Majority of funds dedicated to product development to ensure MILTON remains at the cutting edge of blockchain technology.</li>
            <li>Significant investment in marketing and partnerships to drive adoption and expand MILTON's ecosystem.</li>
            <li>Operational costs cover essential expenses to maintain a high-functioning team and compliant operations.</li>
            <li>Equal emphasis on community initiatives and research & innovation to foster growth and future-proof the platform.</li>
            <li>All fund allocations are subject to regular review and may be adjusted based on market conditions and strategic priorities.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}