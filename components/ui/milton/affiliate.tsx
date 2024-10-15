'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@/lib/auth/user-provider'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Copy, CheckCircle, Users, Coins } from 'lucide-react'

interface ReferralData {
  id: string
  email: string
  date: string
  status: 'pending' | 'completed'
}

interface AffiliateStats {
  totalReferrals: number
  activeReferrals: number
  totalEarnings: number
  pendingEarnings: number
}

export default function Affiliate() {
  const { user } = useUser()
  const [referralCode, setReferralCode] = useState<string>('')
  const [referralLink, setReferralLink] = useState<string>('')
  const [referrals, setReferrals] = useState<ReferralData[]>([])
  const [stats, setStats] = useState<AffiliateStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0
  })
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchAffiliateData = async () => {
      setIsLoading(true)
      try {
        // Replace with actual API calls
        const codeResponse = await fetch('/api/affiliate/code')
        const codeData = await codeResponse.json()
        setReferralCode(codeData.code)
        setReferralLink(`https://miltontoken.com/ref/${codeData.code}`)

        const referralsResponse = await fetch('/api/affiliate/referrals')
        const referralsData = await referralsResponse.json()
        setReferrals(referralsData)

        const statsResponse = await fetch('/api/affiliate/stats')
        const statsData = await statsResponse.json()
        setStats(statsData)
      } catch (error) {
        console.error('Error fetching affiliate data:', error)
        toast({
          title: "Error",
          description: "Failed to load affiliate data. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchAffiliateData()
    }
  }, [user])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "The referral link has been copied to your clipboard.",
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Affiliate Dashboard</CardTitle>
        <CardDescription>Manage your referrals and track your earnings</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Referrals
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalReferrals}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Referrals
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeReferrals}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Earnings
                  </CardTitle>
                  <Coins className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Earnings
                  </CardTitle>
                  <Loader2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.pendingEarnings.toFixed(2)}</div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Your Referral Link</CardTitle>
                <CardDescription>Share this link to earn rewards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex space-x-2">
                  <Input value={referralLink} readOnly />
                  <Button onClick={() => copyToClipboard(referralLink)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <Label htmlFor="referral-code">Referral Code</Label>
                  <Input id="referral-code" value={referralCode} readOnly />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="referrals">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>{referral.email}</TableCell>
                    <TableCell>{new Date(referral.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        referral.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {referral.status === 'completed' ? (
                          <>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Completed
                          </>
                        ) : (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Pending
                          </>
                        )}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => window.open('https://miltontoken.com/affiliate-terms', '_blank')}>
          View Affiliate Terms
        </Button>
      </CardFooter>
    </Card>
  )
}