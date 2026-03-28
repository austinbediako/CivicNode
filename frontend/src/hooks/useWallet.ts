"use client";

import { useWallet as useProviderWallet } from "@/components/WalletProvider";

/**
 * Custom hook wrapping standard Sui wallet state.
 * Exposes wallet connection, auth status, and transaction signing.
 */
export function useWallet() {
  const {
    currentWallet,
    currentAccount,
    connect,
    disconnect,
    signTransaction,
    signAndExecuteTransaction,
    wallets,
    isAuthenticating,
    authError,
  } = useProviderWallet();

  const isConnected = !!currentWallet;
  const address = currentAccount?.address || null;

  return {
    connected: isConnected,
    address,
    connect,
    disconnect,
    wallets,
    signTransaction,
    signAndExecuteTransaction,
    isAuthenticating,
    authError,
  };
}
