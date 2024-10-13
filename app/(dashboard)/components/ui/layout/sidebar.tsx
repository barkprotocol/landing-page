import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Zap, BarChart, Settings, HelpCircle, Search, Home, Wallet, ArrowLeftRight, PieChart, Users, Bell, CreditCard, Gift, Sparkles } from 'lucide-react'

const sidebarNavItems = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Zap,
  },
  {
    title: "Wallet",
    href: "/wallet",
    icon: Wallet,
  },
  {
    title: "Swap",
    href: "/swap",
    icon: ArrowLeftRight,
  },
  {
    title: "Payments",
    href: "/payments",
    icon: CreditCard,
  },
  {
    title: "Donations",
    href: "/donations",
    icon: Gift,
  },
  {
    title: "Blinks",
    href: "/blinks",
    icon: Sparkles,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart,
  },
  {
    title: "Staking",
    href: "/staking",
    icon: PieChart,
  },
  {
    title: "Community",
    href: "/community",
    icon: Users,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Help & Support",
    href: "/support",
    icon: HelpCircle,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full border-r bg-background">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary mb-2">Milton Platform</h1>
        <div className="flex items-center space-x-4 mb-6">
          <Avatar>
            <AvatarImage src="/avatars/01.png" alt="@username" />
            <AvatarFallback>MP</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-muted-foreground">john@example.com</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search" className="pl-8" />
        </div>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          {sidebarNavItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                pathname === item.href && "bg-muted font-medium"
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            </Button>
          ))}
        </div>
      </ScrollArea>
      <div className="p-6 mt-6 bg-muted">
        <h2 className="mb-2 text-lg font-semibold tracking-tight">
          Quick Actions
        </h2>
        <div className="space-y-1">
          <Button variant="secondary" className="w-full justify-start">
            <Sparkles className="mr-2 h-4 w-4" />
            Quick Blink
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <CreditCard className="mr-2 h-4 w-4" />
            Send Payment
          </Button>
        </div>
      </div>
    </div>
  )
}