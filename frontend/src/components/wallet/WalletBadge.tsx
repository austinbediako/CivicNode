"use client";

import { WalletModal } from "./WalletModal";

/**
 * Wallet badge for the header.
 * Delegates to WalletModal for Enoki zkLogin connection and auth display.
 */
export function WalletBadge() {
  return <WalletModal />;
}
