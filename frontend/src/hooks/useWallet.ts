"use client";

import { useWallet as useProviderWallet } from "@/components/WalletProvider";

/**
 * Custom hook wrapping standard Sui wallet state.
 */
export function useWallet() {
  const { currentWallet, currentAccount, connect, disconnect, signTransaction, wallets } = useProviderWallet();

  const isConnected = !!currentWallet;
  const address = currentAccount?.address || null;

  return {
    connected: isConnected,
    address,
    connect,
    disconnect,
    wallets,
    signTransaction,
  };
}
