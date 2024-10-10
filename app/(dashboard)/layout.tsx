'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Users, Settings, Shield, Activity, Menu, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [solanaBlinkCount, setSolanaBlinkCount] = useState(0);

  const navItems = [
    { href: '/dashboard', icon: Users, label: 'Team' },
    { href: '/dashboard/general', icon: Settings, label: 'General' },
    { href: '/dashboard/activity', icon: Activity, label: 'Activity' },
    { href: '/dashboard/security', icon: Shield, label: 'Security' },
    { href: '/dashboard/solana', icon: Zap, label: 'Solana Actions' },
  ];

  useEffect(() => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const intervalId = setInterval(() => {
      connection.getSlot().then((slot) => {
        setSolanaBlinkCount((prevCount) => prevCount + 1);
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleSolanaAction = async () => {
    try {
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const balance = await connection.getBalance(new PublicKey('11111111111111111111111111111111'));
      alert(`Current balance of system program: ${balance / 1e9} SOL`);
    } catch (error) {
      console.error('Error fetching Solana balance:', error);
      alert('Failed to fetch Solana balance. Check console for details.');
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-68px)] max-w-7xl mx-auto w-full">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4">
        <div className="flex items-center">
          <span className="font-medium">Settings</span>
        </div>
        <Button
          className="-mr-3"
          variant="ghost"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden h-full">
        {/* Sidebar */}
        <AnimatePresence>
          {(isSidebarOpen || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-64 bg-white lg:bg-gray-50 border-r border-gray-200 lg:block lg:relative absolute inset-y-0 left-0 z-40 transform"
            >
              <nav className="h-full overflow-y-auto p-4">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} passHref>
                    <Button
                      variant={pathname === item.href ? 'secondary' : 'ghost'}
                      className={`my-1 w-full justify-start ${
                        pathname === item.href ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-0 lg:p-4">
          <div className="mb-4">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
              className="inline-block bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold"
            >
              Solana Blinks: {solanaBlinkCount}
            </motion.div>
            <Button
              onClick={handleSolanaAction}
              className="ml-4 bg-primary hover:bg-primary/90"
            >
              Fetch Solana Balance
            </Button>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}