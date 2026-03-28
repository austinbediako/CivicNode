"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { type Wallet, type StandardConnectFeature, type StandardConnectOutput, type StandardEventsFeature } from "@mysten/wallet-standard";
import { initializeEnoki } from "@/lib/enoki";

interface WalletContextState {
  wallets: Wallet[];
  currentWallet: Wallet | null;
  currentAccount: any | null; // Account interface depends on @mysten/wallet-standard
  connect: (walletName: string) => Promise<void>;
  disconnect: () => void;
  signTransaction: (transaction: any) => Promise<any>;
}

const WalletContext = createContext<WalletContextState | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [currentWallet, setCurrentWallet] = useState<Wallet | null>(null);
  const [currentAccount, setCurrentAccount] = useState<any | null>(null);

  useEffect(() => {
    // Register enoki
    initializeEnoki();

    // Standard wallet registration mechanism
    const detectWallets = () => {
      // @ts-ignore
      const windowWallets = window.suiWallets?.get() || window.wallets?.get() || [];
      if (Array.isArray(windowWallets)) {
        setWallets([...windowWallets]);
      } else {
        // Fallback for some older implementations if an array isn't returned
        // @ts-ignore
        setWallets(Object.values(window.suiWallets || {}));
      }
    };
    
    // Check after delay for scripts to load
    const timer = setTimeout(detectWallets, 1500);

    // Listen to registered event
    const handleRegister = (e: any) => {
      detectWallets();
    };

    window.addEventListener("wallet-standard:register-wallet", handleRegister);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("wallet-standard:register-wallet", handleRegister);
    };
  }, []);

  const connect = useCallback(async (walletName: string) => {
    const wallet = wallets.find((w) => w.name === walletName);
    if (!wallet) throw new Error(`Wallet ${walletName} not found`);

    if (!("standard:connect" in wallet.features)) {
      throw new Error("Wallet does not support standard connecting");
    }

    const connectFeature = wallet.features["standard:connect"] as StandardConnectFeature["standard:connect"];
    const output: StandardConnectOutput = await connectFeature.connect();
    
    setCurrentWallet(wallet);
    setCurrentAccount(output.accounts[0] || null);
  }, [wallets]);

  const disconnect = useCallback(() => {
    if (currentWallet && "standard:disconnect" in currentWallet.features) {
      const disconnectFeature: any = currentWallet.features["standard:disconnect"];
      disconnectFeature.disconnect().catch(console.error);
    }
    
    setCurrentWallet(null);
    setCurrentAccount(null);
  }, [currentWallet]);

  const signTransaction = useCallback(async (transaction: any) => {
    if (!currentWallet || !currentAccount) {
      throw new Error("Wallet not connected");
    }

    // Prefer sui:signTransaction (current), fall back to deprecated sui:signTransactionBlock
    const feature: any =
      currentWallet.features["sui:signTransaction"] ||
      currentWallet.features["sui:signTransactionBlock"];
    if (!feature) throw new Error("Wallet cannot sign transactions");

    if (currentWallet.features["sui:signTransaction"]) {
      return await feature.signTransaction({
        transaction,
        account: currentAccount,
        chain: 'sui:testnet',
      });
    }

    // Legacy fallback
    return await feature.signTransactionBlock({
      transactionBlock: transaction,
      account: currentAccount,
      chain: 'sui:testnet',
    });

  }, [currentWallet, currentAccount]);

  // Subscribe to changes if supported
  useEffect(() => {
    if (!currentWallet) return;

    if ("standard:events" in currentWallet.features) {
      const feature = currentWallet.features["standard:events"] as StandardEventsFeature["standard:events"];
      if (!feature) return;

      const unlisten = feature.on("change", (properties: any) => {
        if (properties.accounts) {
          setCurrentAccount(properties.accounts[0] || null);
        }
      });
      return () => unlisten();
    }
  }, [currentWallet]);

  return (
    <WalletContext.Provider value={{ wallets, currentWallet, currentAccount, connect, disconnect, signTransaction }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
