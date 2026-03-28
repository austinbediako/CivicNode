"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    const token = getToken();
    if (token && !isTokenExpired(token)) {
      const payload = decodeToken(token);
      if (payload) {
        setUser({
          walletAddress: payload.walletAddress,
          role: payload.role,
          communityId: payload.communityId,
        });
      }
    }
    setIsLoading(false);
  }, []);

  return {
    user,
    isAuthenticated: user !== null,
    isAdmin: user?.role === UserRole.ADMIN,
    isLoading,
  };
}
