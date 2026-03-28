"use client";

import { WalletModal } from "./WalletModal";

/**
 * Wallet badge for the header.
 * Delegates entirely to RainbowKit's ConnectButton via WalletModal.
 */
export function WalletBadge() {
  return <WalletModal />;
}
