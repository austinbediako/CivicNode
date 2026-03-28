"use client";

import { useWallet } from "@/hooks/useWallet";
import { useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * Wallet connection and authentication UI (header version).
 * Flow: Connect wallet → sign message → verify with backend → get JWT.
 * Shows Enoki OAuth options (Google, Twitch) with branded icons.
 */
export function WalletModal() {
  const { connected, address, connect, disconnect, wallets, isAuthenticating, authError } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  // Authenticating state
  if (isAuthenticating) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-800 border border-dark-700 text-sm">
        <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
        <span className="text-dark-300">Signing in…</span>
      </div>
    );
  }

  // Connected and authenticated
  if (connected && address) {
    return (
      <div className="flex items-center gap-2">
        {authError && (
          <span className="text-xs text-accent-400" title={authError}>Auth failed</span>
        )}
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
            {address.slice(0, 6)}…{address.slice(-4)}
          </span>
        </button>
      </div>
    );
  }

  const enokiWallets = wallets.filter((w) => w.name.includes("Enoki"));

  // Disconnected — show connect button with dropdown
  return (
    <div className="relative">
      <button
        onClick={() => { setIsOpen(!isOpen); setConnectError(null); }}
        className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 transition-colors text-white font-medium focus:outline-none"
      >
        Connect Wallet
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-dark-800 border border-dark-700 rounded-xl shadow-xl overflow-hidden z-50">
          <div className="px-3 py-2 border-b border-dark-700">
            <span className="text-xs font-medium text-dark-400 uppercase tracking-wider">Sign in with zkLogin</span>
          </div>
          <div className="p-2 flex flex-col gap-1">
            {enokiWallets.length > 0 ? (
              enokiWallets.map((wallet) => {
                const isGoogle = wallet.name.toLowerCase().includes("google");
                const isTwitch = wallet.name.toLowerCase().includes("twitch");
                return (
                  <button
                    key={wallet.name}
                    onClick={async () => {
                      setConnectError(null);
                      try {
                        await connect(wallet.name);
                        setIsOpen(false);
                      } catch (err: any) {
                        setConnectError(err.message || "Connection failed");
                        console.error("Failed to connect", err);
                      }
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-dark-200 hover:bg-dark-700 hover:text-white rounded-lg transition-colors focus:outline-none"
                  >
                    {isGoogle && <GoogleIcon />}
                    {isTwitch && <TwitchIcon />}
                    <span>
                      {isGoogle ? "Continue with Google" : isTwitch ? "Continue with Twitch" : wallet.name.replace("Enoki: ", "Continue with ")}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-3 text-sm text-dark-400 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading wallets…
              </div>
            )}
          </div>
          {connectError && (
            <div className="px-3 py-2 border-t border-dark-700 text-xs text-accent-400">
              {connectError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function TwitchIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
      <path d="M11.571 4.714h1.715v5.143H11.57V4.714zm4.715 0H18v5.143h-1.714V4.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0H6zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714v9.429z" fill="#9146FF"/>
    </svg>
  );
}
