"use client";

import { useWallet } from "@/hooks/useWallet";
import { useState } from "react";

/**
 * Wallet connection UI.
 * Shows Enoki OAuth options when disconnected.
 * Shows address and allows disconnect when connected.
 */
export function WalletModal() {
  const { connected, address, connect, disconnect, wallets } = useWallet();
  const [isOpen, setIsOpen] = useState(false);

  if (connected && address) {
    return (
      <button
        onClick={() => {
          disconnect();
          setIsOpen(false);
        }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-800 border border-dark-700 focus:outline-none hover:border-dark-600 transition-colors text-sm"
        title="Click to disconnect"
      >
        <div className="w-2 h-2 bg-primary-500 rounded-full" />
        <span className="font-mono text-dark-200">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 transition-colors text-white font-medium focus:outline-none"
      >
        Connect
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-xl overflow-hidden z-50">
          <div className="p-2 flex flex-col gap-1">
            {wallets.filter((w) => w.name.includes("Enoki")).length > 0 ? (
              wallets
                .filter((w) => w.name.includes("Enoki"))
                .map((wallet) => (
                  <button
                    key={wallet.name}
                    onClick={async () => {
                      try {
                        await connect(wallet.name);
                        setIsOpen(false);
                      } catch (err) {
                        console.error("Failed to connect", err);
                      }
                    }}
                    className="text-left px-3 py-2 text-sm text-dark-200 hover:bg-dark-700 hover:text-white rounded-md transition-colors focus:outline-none"
                  >
                    {wallet.name.replace('Enoki: ', 'Login with ')}
                  </button>
                ))
            ) : (
              <div className="px-3 py-2 text-sm text-dark-400">Loading wallets...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
