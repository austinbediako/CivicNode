"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
import { type Wallet, type StandardConnectFeature, type StandardConnectOutput, type StandardEventsFeature } from "@mysten/wallet-standard";
import { initializeEnoki } from "@/lib/enoki";
import { setToken, clearToken } from "@/lib/auth";
import { verifyWallet } from "@/lib/api";

interface WalletContextState {
  wallets: Wallet[];
  currentWallet: Wallet | null;
  currentAccount: any | null;
  connect: (walletName: string) => Promise<void>;
  disconnect: () => void;
  signTransaction: (transaction: any) => Promise<any>;
  signAndExecuteTransaction: (transaction: any) => Promise<any>;
  isAuthenticating: boolean;
  authError: string | null;
}

const WalletContext = createContext<WalletContextState | undefined>(undefined);

const SUI_CHAIN = "sui:testnet";

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [currentWallet, setCurrentWallet] = useState<Wallet | null>(null);
  const [currentAccount, setCurrentAccount] = useState<any | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const authAttemptedRef = useRef<string | null>(null);

  useEffect(() => {
    initializeEnoki();

    const detectWallets = () => {
      // @ts-ignore — wallet standard global
      const windowWallets = window.suiWallets?.get() || window.wallets?.get() || [];
      if (Array.isArray(windowWallets)) {
        setWallets([...windowWallets]);
      } else {
        // @ts-ignore
        setWallets(Object.values(window.suiWallets || {}));
      }
    };

    const timer = setTimeout(detectWallets, 1500);

    const handleRegister = () => { detectWallets(); };
    window.addEventListener("wallet-standard:register-wallet", handleRegister);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("wallet-standard:register-wallet", handleRegister);
    };
  }, []);

  // --- Auth flow: after wallet connects, sign message → verify → store JWT ---
  useEffect(() => {
    if (!currentWallet || !currentAccount) return;

    const address: string = currentAccount.address;
    if (!address) return;

    // Don't re-auth for the same address
    if (authAttemptedRef.current === address) return;
    authAttemptedRef.current = address;

    const runAuth = async () => {
      setIsAuthenticating(true);
      setAuthError(null);

      try {
        const timestamp = Date.now();
        const message = `Sign in to CivicNode\nWallet: ${address}\nTimestamp: ${timestamp}`;
        const messageBytes = new TextEncoder().encode(message);

        // Sign personal message using wallet standard feature
        const signFeature: any =
          currentWallet.features["sui:signPersonalMessage"] ||
          currentWallet.features["sui:signMessage"];

        if (!signFeature) {
          throw new Error("Wallet does not support message signing. Please use a compatible wallet.");
        }

        const signMethod = signFeature.signPersonalMessage || signFeature.signMessage;
        const { signature } = await signMethod({
          message: messageBytes,
          account: currentAccount,
        });

        // Verify with backend and get JWT
        const result = await verifyWallet(address, signature, message);
        setToken(result.token);

        // Force useAuth hooks to re-evaluate by dispatching a storage event
        window.dispatchEvent(new Event("civicnode:auth-change"));
      } catch (err: any) {
        console.error("[WalletProvider] Auth flow failed:", err);
        setAuthError(err.message || "Authentication failed");
        // Don't disconnect — user might retry
      } finally {
        setIsAuthenticating(false);
      }
    };

    runAuth();
  }, [currentWallet, currentAccount]);

  const connect = useCallback(async (walletName: string) => {
    const wallet = wallets.find((w) => w.name === walletName);
    if (!wallet) throw new Error(`Wallet ${walletName} not found`);

    if (!("standard:connect" in wallet.features)) {
      throw new Error("Wallet does not support standard connecting");
    }

    // Reset auth state for new connection
    authAttemptedRef.current = null;
    setAuthError(null);

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

    clearToken();
    authAttemptedRef.current = null;
    setCurrentWallet(null);
    setCurrentAccount(null);
    setAuthError(null);

    window.dispatchEvent(new Event("civicnode:auth-change"));
  }, [currentWallet]);

  const signTransaction = useCallback(async (transaction: any) => {
    if (!currentWallet || !currentAccount) {
      throw new Error("Wallet not connected");
    }

    const feature: any =
      currentWallet.features["sui:signTransaction"] ||
      currentWallet.features["sui:signTransactionBlock"];
    if (!feature) throw new Error("Wallet cannot sign transactions");

    if (currentWallet.features["sui:signTransaction"]) {
      return await feature.signTransaction({
        transaction,
        account: currentAccount,
        chain: SUI_CHAIN,
      });
    }

    return await feature.signTransactionBlock({
      transactionBlock: transaction,
      account: currentAccount,
      chain: SUI_CHAIN,
    });
  }, [currentWallet, currentAccount]);

  const signAndExecuteTransaction = useCallback(async (transaction: any) => {
    if (!currentWallet || !currentAccount) {
      throw new Error("Wallet not connected");
    }

    // Prefer signAndExecuteTransaction, fall back to signAndExecuteTransactionBlock
    const feature: any =
      currentWallet.features["sui:signAndExecuteTransaction"] ||
      currentWallet.features["sui:signAndExecuteTransactionBlock"];

    if (!feature) {
      throw new Error("Wallet does not support transaction execution");
    }

    if (currentWallet.features["sui:signAndExecuteTransaction"]) {
      return await feature.signAndExecuteTransaction({
        transaction,
        account: currentAccount,
        chain: SUI_CHAIN,
      });
    }

    return await feature.signAndExecuteTransactionBlock({
      transactionBlock: transaction,
      account: currentAccount,
      chain: SUI_CHAIN,
    });
  }, [currentWallet, currentAccount]);

  // Subscribe to account changes
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
    <WalletContext.Provider
      value={{
        wallets,
        currentWallet,
        currentAccount,
        connect,
        disconnect,
        signTransaction,
        signAndExecuteTransaction,
        isAuthenticating,
        authError,
      }}
    >
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
