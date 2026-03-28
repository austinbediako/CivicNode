"use client";

import { registerEnokiWallets } from '@mysten/enoki';
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';

let enokiRegistered = false;

export function initializeEnoki() {
  if (typeof window === 'undefined') return;
  if (enokiRegistered) return;

  const network = (process.env.NEXT_PUBLIC_SUI_NETWORK as 'testnet' | 'mainnet') || 'testnet';
  const client = new SuiJsonRpcClient({
    url: network === 'mainnet' ? 'https://fullnode.mainnet.sui.io:443' : 'https://fullnode.testnet.sui.io:443',
    network,
  });

  // Use dummy keys if environment variables aren't defined. In production, these should be real.
  const apiKey = process.env.NEXT_PUBLIC_ENOKI_API_KEY || 'enoki_public_dev_key';
  
  registerEnokiWallets({
    apiKey,
    providers: {
      google: { clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy-google-id' },
      twitch: { clientId: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || 'dummy-twitch-id' },
    },
    client,
    network: 'testnet',
  });

  enokiRegistered = true;
}
