'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/overview"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { AccountSummary } from "@/components/dashboard/account-summary"
import { TokenBalances } from "@/components/dashboard/token-balances"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDateRangePicker } from "@/components/dashboard/date-range-picker"
import { DollarSign, Users, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  change: string
  changeTimeframe?: string
  icon: React.ReactNode
}

function StatCard({ title, value, change, changeTimeframe = "from last month", icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {React.cloneElement(icon as React.ReactElement, {
          'aria-hidden': 'true',
          className: 'h-4 w-4 text-muted-foreground'
        })}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          <span className="sr-only">Change: </span>
          {change} {changeTimeframe}
        </p>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker />
          <Button>
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Download
          </Button>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value="$45,231.89"
              change="+20.1%"
              icon={<DollarSign />}
            />
            <StatCard
              title="Active Users"
              value="+2,350"
              change="+180.1%"
              icon={<Users />}
            />
            <StatCard
              title="Sales"
              value="+12,234"
              change="+19%"
              icon={<ArrowUpRight />}
            />
            <StatCard
              title="Active Now"
              value="+573"
              change="+201"
              changeTimeframe="since last hour"
              icon={<ArrowDownRight />}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  You made 265 sales this month.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivity />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics">
          <p>Analytics content (to be implemented)</p>
        </TabsContent>
        <TabsContent value="reports">
          <p>Reports content (to be implemented)</p>
        </TabsContent>
        <TabsContent value="notifications">
          <p>Notifications content (to be implemented)</p>
        </TabsContent>
      </Tabs>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Account Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <AccountSummary />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Token Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <TokenBalances />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}