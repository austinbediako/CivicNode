"use client";

import Link from "next/link";
import { Bell, Shield } from "lucide-react";
import { WalletBadge } from "@/components/wallet/WalletBadge";

interface HeaderProps {
  communityName?: string;
}

export function Header({ communityName = "CivicNode Community" }: HeaderProps) {
  return (
    <header className="h-16 border-b border-dark-800 bg-dark-950/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Logo & Community Name */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-dark-50 hidden sm:block">
              CivicNode
            </span>
          </Link>
          <span className="hidden md:block text-dark-500 mx-2">|</span>
          <span className="hidden md:block text-sm text-dark-400">
            {communityName}
          </span>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button
            className="relative p-2 text-dark-400 hover:text-dark-200 transition-colors rounded-lg hover:bg-dark-800"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {/* TODO(civicnode): Add notification count badge when notifications API is ready */}
          </button>

          {/* Wallet */}
          <WalletBadge />
        </div>
      </div>
    </header>
  );
}
