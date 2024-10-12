'use client'

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { signIn } from '@/lib/actions';
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';

const DynamicWalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

const SOLANA_ICON_URL = "https://cryptologos.cc/logos/solana-sol-logo.png?v=024";

export function SolanaLoginButton() {
  const { wallet, connect, disconnect, connecting, connected, publicKey, signMessage } = useWallet();
  const { setVisible } = useWalletModal();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSolanaConfirmed, setIsSolanaConfirmed] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConnectOrSelect = useCallback(async () => {
    if (connecting) return;

    if (wallet) {
      setIsConnecting(true);
      try {
        await connect();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        toast({
          title: "Connection Failed",
          description: "Failed to connect to your wallet. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsConnecting(false);
      }
    } else {
      setVisible(true);
    }
  }, [wallet, connect, connecting, setVisible, toast]);

  const handleLogin = useCallback(async () => {
    if (!publicKey || !signMessage) return;

    setIsLoggingIn(true);
    try {
      const message = `Login to App: ${new Date().toISOString()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await signMessage(encodedMessage);
      
      const formData = new FormData();
      formData.append('walletAddress', publicKey.toBase58());
      formData.append('signedMessage', Buffer.from(signedMessage).toString('base64'));
      formData.append('message', message);
      
      const result = await signIn(formData);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setIsSolanaConfirmed(true); // Set Solana confirmation to true
      toast({
        title: "Login Successful",
        description: "You have successfully logged in with your Solana wallet.",
      });
      
      // Delay the redirect to show the success message
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Failed to login with Solana:', error);
      toast({
        title: "Login Failed",
        description: "Failed to login with your Solana wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  }, [publicKey, signMessage, toast, router]);

  const handleDisconnect = useCallback(async () => {
    if (disconnect) {
      await disconnect();
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
      });
    }
  }, [disconnect, toast]);

  const buttonClasses = cn(
    "bg-gray-800 text-white hover:bg-gray-700 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600",
    "font-regular px-6 py-3 rounded-md transition-all duration-200 ease-in-out",
    "transform hover:scale-100 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:ring-opacity-60",
    "w-full sm:w-auto min-w-[367px]" 
  );

  if (!mounted) {
    return (
      <Button variant="outline" className={buttonClasses} disabled>
        <Image src={SOLANA_ICON_URL} alt="Solana Logo" width={24} height={24} className="mr-3" />
        <span>Connect Wallet</span>
      </Button>
    );
  }

  if (connected && publicKey) {
    return (
      <Button
        variant="outline"
        className={buttonClasses}
        onClick={isLoggingIn ? undefined : handleLogin}
        disabled={isLoggingIn || isSolanaConfirmed} // Added isSolanaConfirmed to disable button
      >
        <Image src={SOLANA_ICON_URL} alt="Solana Logo" width={20} height={20} className="mr-2" />
        {isLoggingIn ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
            <span>Logging in...</span>
          </>
        ) : isSolanaConfirmed ? (
          <>
            <span className="sr-only">Solana Confirmed</span>
            <span aria-hidden="true">Solana Confirmed - Redirecting...</span>
          </>
        ) : (
          <>
            <span className="sr-only">Login with Solana</span>
            <span aria-hidden="true">
              Login as {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
            </span>
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      className={buttonClasses}
      onClick={handleConnectOrSelect}
      disabled={isConnecting || connecting}
    >
      <Image src={SOLANA_ICON_URL} alt="Solana Logo" width={24} height={24} className="mr-3" />
      {isConnecting || connecting ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
          <span>Connecting...</span>
        </>
      ) : (
        <span>Connect Solana Wallet</span>
      )}
    </Button>
  );
}