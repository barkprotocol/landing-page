'use client';

import { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { useToast } from "@/components/ui/use-toast"
import { DashboardNavigation } from './components/ui/layout/dashboard-nav';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Bell, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// DashboardLayout component
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [solanaBlinkCount, setSolanaBlinkCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const intervalId = setInterval(() => {
      connection.getSlot().then(() => {
        setSolanaBlinkCount((prevCount) => prevCount + 1);
      }).catch(error => {
        console.error('Error fetching Solana slot:', error);
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleSolanaAction = useCallback(async () => {
    try {
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const balance = await connection.getBalance(new PublicKey('11111111111111111111111111111111'));
      toast({
        title: "Solana Balance",
        description: `Current balance of system program: ${balance / 1e9} SOL`,
      });
    } catch (error) {
      console.error('Error fetching Solana balance:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Solana balance. Check console for details.",
        variant: "destructive",
      });
    }
  }, [toast]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardNavigation />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <h1 className="text-2xl font-semibold text-foreground">Milton Dashboard</h1>
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
              className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold"
            >
              Solana Blinks: {solanaBlinkCount}
            </motion.div>
            <Button
              onClick={handleSolanaAction}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Fetch Solana Balance
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
