"use client";

import React, { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { useCurrentAccount, useSignPersonalMessage, useDisconnectWallet } from "@mysten/dapp-kit";
import { setToken, clearToken } from "@/lib/auth";
import { verifyWallet } from "@/lib/api";

interface AuthContextState {
  isAuthenticating: boolean;
  authError: string | null;
}

const AuthContext = createContext<AuthContextState>({
  isAuthenticating: false,
  authError: null,
});

/**
 * Watches for wallet connection changes via dApp Kit.
 * When a new account connects, automatically signs an auth message,
 * verifies with the backend, and stores the JWT.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const { mutate: disconnect } = useDisconnectWallet();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const authAttemptedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentAccount) {
      // Account disconnected — clear auth state
      if (authAttemptedRef.current) {
        clearToken();
        authAttemptedRef.current = null;
        window.dispatchEvent(new Event("civicnode:auth-change"));
      }
      return;
    }

    const address = currentAccount.address;
    if (!address || authAttemptedRef.current === address) return;
    authAttemptedRef.current = address;

    const runAuth = async () => {
      setIsAuthenticating(true);
      setAuthError(null);

      try {
        const timestamp = Date.now();
        const message = `Sign in to CivicNode\nWallet: ${address}\nTimestamp: ${timestamp}`;
        const messageBytes = new TextEncoder().encode(message);

        const { signature } = await signPersonalMessage({
          message: messageBytes,
        });

        const result = await verifyWallet(address, signature, message);
        setToken(result.token);
        window.dispatchEvent(new Event("civicnode:auth-change"));
      } catch (err: any) {
        console.error("[AuthProvider] Auth flow failed:", err);
        setAuthError(err.message || "Authentication failed");
      } finally {
        setIsAuthenticating(false);
      }
    };

    runAuth();
  }, [currentAccount, signPersonalMessage]);

  return (
    <AuthContext.Provider value={{ isAuthenticating, authError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthState() {
  return useContext(AuthContext);
}
