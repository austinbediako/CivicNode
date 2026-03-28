"use client";

import { useState, useEffect, useCallback } from "react";
import { getToken, decodeToken, isTokenExpired } from "@/lib/auth";
import { UserRole } from "@/types";

interface AuthUser {
  walletAddress: string;
  role: UserRole;
  communityId: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(() => {
    const token = getToken();
    if (token && !isTokenExpired(token)) {
      const payload = decodeToken(token);
      if (payload) {
        setUser({
          walletAddress: payload.walletAddress,
          role: payload.role,
          communityId: payload.communityId,
        });
      } else {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();

    // Re-evaluate when WalletProvider stores or clears the JWT
    const handleAuthChange = () => { checkAuth(); };
    window.addEventListener("civicnode:auth-change", handleAuthChange);
    return () => {
      window.removeEventListener("civicnode:auth-change", handleAuthChange);
    };
  }, [checkAuth]);

  return {
    user,
    isAuthenticated: user !== null,
    isAdmin: user?.role === UserRole.ADMIN,
    isLoading,
  };
}
