"use client";

import { type ReactNode, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  SuiClientProvider,
  WalletProvider,
  createNetworkConfig,
} from "@mysten/dapp-kit";
import {
  JsonRpcHTTPTransport,
  SuiJsonRpcClient,
  getJsonRpcFullnodeUrl,
} from "@mysten/sui/jsonRpc";
import { registerEnokiWallets } from "@mysten/enoki";
import { AuthProvider } from "@/components/AuthProvider";

const SUI_NETWORK =
  (process.env.NEXT_PUBLIC_SUI_NETWORK as "testnet" | "mainnet") || "testnet";

const testnetUrl = getJsonRpcFullnodeUrl("testnet");
const mainnetUrl = getJsonRpcFullnodeUrl("mainnet");

const { networkConfig } = createNetworkConfig({
  testnet: { transport: new JsonRpcHTTPTransport({ url: testnetUrl }), network: "testnet" },
  mainnet: { transport: new JsonRpcHTTPTransport({ url: mainnetUrl }), network: "mainnet" },
});

// Shared SuiClient for Enoki registration (needs a client instance)
const suiClient = new SuiJsonRpcClient({ url: SUI_NETWORK === "mainnet" ? mainnetUrl : testnetUrl, network: SUI_NETWORK });

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  // Register Enoki wallet (Google) so dApp Kit can discover it
  useEffect(() => {
    const cleanup: any = registerEnokiWallets({
      apiKey: process.env.NEXT_PUBLIC_ENOKI_API_KEY || "",
      providers: {
        google: {
          clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
        },
      },
      client: suiClient,
      network: SUI_NETWORK,
    });
    return () => {
      if (typeof cleanup === "function") cleanup();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork={SUI_NETWORK}>
        <WalletProvider autoConnect>
          <AuthProvider>{children}</AuthProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
