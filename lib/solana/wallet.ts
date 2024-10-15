import {
    WalletAdapterNetwork,
    WalletProvider,
    ConnectionProvider,
    useWallet,
  } from '@solana/wallet-adapter-react';
  import { PhantomWalletAdapter, SolflareWalletAdapter, BackpackWalletAdapter } from '@solana/wallet-adapter-wallets';
  import { Connection } from '@solana/web3.js';
  import React, { createContext, useContext, ReactNode, useMemo } from 'react';
  
  const network = WalletAdapterNetwork.Devnet; // Change as necessary
  
  // Create a context for the wallet
  const WalletContext = createContext<WalletContextType | undefined>(undefined);
  
  interface WalletContextType {
    connected: boolean;
    publicKey: string | null;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
  }
  
  export const WalletProviderWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
    const wallets = useMemo(() => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
    ], []);
  
    return (
      <ConnectionProvider connection={new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com')}>
        <WalletProvider wallets={wallets}>
          {children}
        </WalletProvider>
      </ConnectionProvider>
    );
  };
  
  // Custom hook to use the wallet context
  export const useSolanaWallet = (): WalletContextType => {
    const wallet = useWallet();
  
    if (!wallet) {
      throw new Error('useSolanaWallet must be used within a WalletProvider');
    }
  
    return {
      connected: wallet.connected,
      publicKey: wallet.publicKey?.toString() || null,
      connect: wallet.connect,
      disconnect: wallet.disconnect,
    };
  };
  