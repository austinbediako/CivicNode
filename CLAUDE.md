# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CivicNode is a Web3/blockchain civic engagement platform. Only the `frontend/` directory is actively developed — `Backend/` and `Contract/` are empty placeholders.

## Development Commands

All commands run from `frontend/`. The package manager is **pnpm**.

```bash
cd frontend
pnpm dev        # Start dev server at http://localhost:3000
pnpm build      # Production build
pnpm start      # Serve production build
```

No test framework is configured yet.

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with **Pages Router** (`src/pages/`)
- **Web3**: Wagmi v2 + Viem + RainbowKit (multi-wallet connection UI)
- **Data fetching**: TanStack React Query v5
- **Styling**: CSS Modules (no Tailwind)
- **TypeScript**: Strict mode enabled

### Provider Hierarchy (`_app.tsx`)
```
WagmiProvider (Web3 config)
  └─ QueryClientProvider (TanStack)
       └─ RainbowKitProvider (wallet UI)
            └─ Component
```

### Web3 Configuration (`src/wagmi.ts`)
- Chains: Mainnet, Polygon, Optimism, Arbitrum, Base; Sepolia testnet via `NEXT_PUBLIC_ENABLE_TESTNETS=true`
- WalletConnect project ID is a placeholder (`'YOUR_PROJECT_ID'`) — must be replaced before production deployment

### Webpack Externals (`next.config.js`)
`pino-pretty`, `lokijs`, and `encoding` are externalized to prevent SSR bundling issues from Wagmi/Viem dependencies.

## Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_ENABLE_TESTNETS` | Set to `true` to include Sepolia testnet |
