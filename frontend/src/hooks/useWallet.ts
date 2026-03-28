"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

/**
 * Custom hook wrapping wagmi wallet state via RainbowKit.
 * Provides connected state, address, connect/disconnect functions.
 */
export function useWallet() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  return {
    connected: isConnected,
    address: address ?? null,
    connect: () => {
      const connector = connectors[0];
      if (connector) connect({ connector });
    },
    disconnect: () => disconnect(),
    connectors,
  };
}
