import * as React from "react"
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  BarChart2, CreditCard, Image as ImageIcon, Zap, Send, Wallet, RefreshCcw, 
  DollarSign, PieChart, Award, FileText, VoteIcon, TrendingUp, 
  Settings, HelpCircle, LogOut, Menu, ChevronDown, ChevronRight
} from 'lucide-react'

const logoUrl = "https://ucarecdn.com/b4bae092-141d-4e32-8a9a-1b82caee00f8/miltonlogolight.png"

const navItems = [
  { name: 'Overview', href: '/dashboard/overview', icon: BarChart2 },
  { 
    name: 'Token Management', 
    href: '/dashboard/token',
    icon: CreditCard,
    subItems: [
      { name: 'Mint Tokens', href: '/dashboard/token/mint' },
      { name: 'Transfer Tokens', href: '/dashboard/token/transfer' },
      { name: 'Burn Tokens', href: '/dashboard/token/burn' },
      { name: 'Token Balances', href: '/dashboard/token/balances' },
    ]
  },
  { 
    name: 'NFT Management', 
    href: '/dashboard/nft',
    icon: ImageIcon,
    subItems: [
      { name: 'Mint NFT', href: '/dashboard/nft/mint' },
      { name: 'View NFTs', href: '/dashboard/nft/view' },
      { name: 'Transfer NFTs', href: '/dashboard/nft/transfer' },
      { name: 'NFT Marketplace', href: '/dashboard/nft/marketplace' },
    ]
  },
  { 
    name: 'Blinks', 
    href: '/dashboard/blinks',
    icon: Zap,
    subItems: [
      { name: 'Create Blink', href: '/dashboard/blinks/create' },
      { name: 'Gift', href: '/dashboard/blinks/gift' },
      { name: 'Send', href: '/dashboard/blinks/send' },
      { name: 'Manage Blinks', href: '/dashboard/blinks/manage' },
      { name: 'Blink History', href: '/dashboard/blinks/history' },
    ]
  },
  { 
    name: 'Payments', 
    href: '/dashboard/payments',
    icon: Send,
    subItems: [
      { name: 'Make a Payment', href: '/dashboard/payments/make' },
      { name: 'Payment History', href: '/dashboard/payments/history' },
      { name: 'Recurring Payments', href: '/dashboard/payments/recurring' },
    ]
  },
  { 
    name: 'Donations', 
    href: '/dashboard/donations',
    icon: DollarSign,
    subItems: [
      { name: 'Donate', href: '/dashboard/donations/donate' },
      { name: 'Donation History', href: '/dashboard/donations/history' },
      { name: 'Charity Partners', href: '/dashboard/donations/charities' },
    ]
  },
  { name: 'Wallet', href: '/dashboard/wallet', icon: Wallet },
  { name: 'Swap', href: '/dashboard/swap', icon: RefreshCcw },
  { 
    name: 'Staking', 
    href: '/dashboard/staking',
    icon: PieChart,
    subItems: [
      { name: 'Stake MILTON Tokens', href: '/dashboard/staking' },
      { name: 'Pools', href: '/dashboard/staking/pools' },
    ]
  },
  { name: 'Rewards', href: '/dashboard/rewards', icon: Award },
  { name: 'Transactions', href: '/dashboard/transactions', icon: FileText },
  { name: 'Governance', href: '/dashboard/governance', icon: VoteIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp },
  { 
    name: 'Settings', 
    href: '/dashboard/settings',
    icon: Settings,
    subItems: [
      { name: 'My Profile', href: '/dashboard/settings/profile' },
      { name: 'API Management', href: '/dashboard/settings/api' },
      { name: 'Commerce', href: '/dashboard/settings/commerce' },
      { name: 'Notifications', href: '/dashboard/settings/notifications' },
      { name: 'Account Security', href: '/dashboard/settings/security' },
    ]
  },
  { 
    name: 'Help & Support', 
    href: '/dashboard/help',
    icon: HelpCircle,
    subItems: [
      { name: 'FAQ', href: '/dashboard/help/faq' },
      { name: 'Contact Support', href: '/dashboard/help/contact' },
    ]
  },
  { name: 'Logout', href: '/logout', icon: LogOut },
]

interface NavItemProps {
  item: {
    name: string
    href: string
    icon: React.ElementType
    subItems?: { name: string; href: string }[]
  }
  pathname: string
  setIsSidebarOpen?: (open: boolean) => void
}

function NavItem({ item, pathname, setIsSidebarOpen }: NavItemProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

  return (
    <div className="mb-1">
      <Button
        variant={isActive ? 'secondary' : 'ghost'}
        className={cn(
          "w-full justify-start text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          isActive && "bg-accent text-accent-foreground",
          item.subItems && "flex items-center justify-between"
        )}
        onClick={() => {
          if (item.subItems) {
            setIsOpen(!isOpen)
          } else if (setIsSidebarOpen) {
            setIsSidebarOpen(false)
          }
        }}
      >
        <div className="flex items-center">
          <item.icon className="mr-2 h-4 w-4" />
          <span>{item.name}</span>
        </div>
        {item.subItems && (
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")}
          />
        )}
      </Button>
      {item.subItems && isOpen && (
        <div className="mt-1 ml-4 space-y-1">
          {item.subItems.map((subItem) => (
            <Link key={subItem.href} href={subItem.href} passHref>
              <Button
                variant={pathname === subItem.href ? 'secondary' : 'ghost'}
                className={cn(
                  "w-full justify-start pl-6 text-sm font-normal",
                  pathname === subItem.href ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                )}
                onClick={() => setIsSidebarOpen && setIsSidebarOpen(false)}
              >
                <ChevronRight className="mr-2 h-3 w-3" />
                {subItem.name}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function DashboardNavigation() {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)

  return (
    <TooltipProvider>
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden fixed top-4 left-4 z-40">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex items-center justify-center h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Image src={logoUrl} alt="Milton Logo" width={120} height={40} />
          </div>
          <ScrollArea className="h-[calc(100vh-4rem)] py-6 px-4">
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavItem key={item.href} item={item} pathname={pathname} setIsSidebarOpen={setIsSidebarOpen} />
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      <div className="hidden lg:block w-64 bg-background border-r">
        <div className="flex items-center justify-center h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Image src={logoUrl} alt="Milton Logo" width={120} height={40} />
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)] py-6 px-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Tooltip key={item.href} delayDuration={300}>
                <TooltipTrigger asChild>
                  <div>
                    <NavItem item={item} pathname={pathname} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" align="center" alignOffset={-8}>
                  {item.name}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  )
}