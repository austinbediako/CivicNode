"use client";

import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, Shield } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * Protects pages that require authentication.
 * Redirects to landing page if user is not connected/authenticated.
 * Optionally requires admin role.
 */
export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { connected, isAuthenticating } = useWallet();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for loading states to finish
    if (isLoading || isAuthenticating) return;

    // Not connected at all → redirect to landing
    if (!connected) {
      router.replace("/");
      return;
    }

    // Connected but not authenticated (JWT missing/expired) → redirect
    if (!isAuthenticated) {
      router.replace("/");
      return;
    }

    // Requires admin but user is not admin
    if (requireAdmin && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [connected, isAuthenticated, isAdmin, isLoading, isAuthenticating, requireAdmin, router]);

  // Show loading while checking auth
  if (isLoading || isAuthenticating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
        <span className="text-sm text-dark-400">
          {isAuthenticating ? "Signing in…" : "Loading…"}
        </span>
      </div>
    );
  }

  // Not authenticated — show nothing while redirect happens
  if (!connected || !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Shield className="w-12 h-12 text-dark-600" />
        <p className="text-dark-400 text-sm">Connect your wallet to continue</p>
      </div>
    );
  }

  // Admin required but not admin
  if (requireAdmin && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Shield className="w-12 h-12 text-accent-600" />
        <p className="text-dark-400 text-sm">You don't have permission to access this page</p>
      </div>
    );
  }

  return <>{children}</>;
}
