"use client";

import {
  useCurrentAccount,
  useDisconnectWallet,
} from "@mysten/dapp-kit";
import { useAuthState } from "@/components/AuthProvider";
import { clearToken } from "@/lib/auth";

/**
 * Custom hook wrapping @mysten/dapp-kit wallet state + auth state.
 */
export function useWallet() {
  const currentAccount = useCurrentAccount();
  const { mutate: dappDisconnect } = useDisconnectWallet();
  const { isAuthenticating, authError } = useAuthState();

  const disconnect = () => {
    clearToken();
    dappDisconnect();
    window.dispatchEvent(new Event("civicnode:auth-change"));
  };

  return {
    connected: !!currentAccount,
    address: currentAccount?.address || null,
    disconnect,
    isAuthenticating,
    authError,
  };
}
