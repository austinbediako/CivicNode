import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  sepolia,
} from "wagmi/chains";

const enableTestnets = process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true";

export const config = getDefaultConfig({
  appName: "CivicNode",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "YOUR_PROJECT_ID",
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    ...(enableTestnets ? [sepolia] : []),
  ],
  ssr: true,
});
