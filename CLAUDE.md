# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CivicNode is an AI-powered community governance platform built for Ghana. It enables communities to upload discussion logs, synthesize proposals via Claude AI, vote on-chain via Sui blockchain (using Enoki zkLogin), and manage community treasuries.

## Monorepo Structure

```
CivicNode/
├── frontend/          — Next.js 14 App Router, TypeScript, Tailwind CSS
├── Backend/           — Node.js, Express, TypeScript, Mongoose, Anthropic SDK
├── Contract/          — Move smart contracts on Sui blockchain
├── packages/
│   └── shared-types/  — @civicnode/shared-types: shared TypeScript interfaces & enums
├── docker-compose.yml — MongoDB 7 + Redis 7-alpine for local dev
├── pnpm-workspace.yaml
├── tsconfig.base.json — Base TypeScript config (strict, ES2022, NodeNext)
└── .env.example       — All required environment variables documented
```

## Development Commands

Package manager: **pnpm** (workspaces monorepo)

```bash
# First-time setup
pnpm setup                  # Install deps + build shared-types

# Start local services
docker compose up -d        # MongoDB on 27017, Redis on 6379

# Development
pnpm dev                    # Runs frontend (3000) + backend (4000) in parallel
pnpm --filter frontend dev  # Frontend only
pnpm --filter Backend dev   # Backend only

# Build & check
pnpm build                  # Build all packages
pnpm typecheck              # TypeScript check all packages
pnpm lint                   # Lint all packages
```

## Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript strict, Tailwind CSS, Enoki zkLogin (Google/Twitch)
- **Backend**: Express, TypeScript strict, Mongoose (MongoDB), Anthropic Claude SDK, Sui SDK (@mysten/sui), node-cron
- **Contracts**: Move language on Sui blockchain
- **Shared Types**: @civicnode/shared-types package used by frontend and Backend
- **Infrastructure**: Docker Compose (MongoDB 7, Redis 7-alpine)

### Key Flows
1. **Wallet Auth**: User connects via Enoki zkLogin (Google/Twitch) → signs message → Backend verifies Sui signature → issues JWT
2. **AI Synthesis**: Admin uploads chat log → Backend streams Claude synthesis via SSE → draft proposal created
3. **Voting**: Proposal published → members vote on-chain via Sui → tallies updated in real-time
4. **Execution**: Cron job checks deadlines → quorum met → executes on-chain fund transfer via Sui PTB → records transaction

### Environment Variables
See `.env.example` for the complete list. Key variables:
- `MONGODB_URI` — MongoDB connection string
- `REDIS_URL` — Redis connection string
- `JWT_SECRET` — JWT signing secret
- `ANTHROPIC_API_KEY` — Claude API key for synthesis
- `SUI_RPC_URL` — Sui RPC endpoint
- `SUI_PACKAGE_ID` — Deployed Sui package ID
- `NEXT_PUBLIC_ENOKI_API_KEY` — Enoki public API key for zkLogin
- `NEXT_PUBLIC_API_URL` — Backend URL for frontend

### Backend Structure (`Backend/src/`)
```
config/         — env.ts (Zod-validated), database.ts (Mongoose), redis.ts (ioredis)
models/         — User, Community, ChatLog, Proposal, Vote, Transaction (Mongoose)
schemas/        — Zod validation: auth, proposal, vote
middleware/     — JWT auth, Redis rate limiting, Zod validation factory
services/       — anthropic.ts (Claude streaming), sui.ts (SDK wrapper), oracle.ts (SUI/GHS rate), execution.ts (cron)
controllers/    — Business logic for each route group
routes/         — Express routers: auth, communities, logs, proposals, votes, treasury, health
app.ts          — Express setup with helmet, CORS, error handling
server.ts       — Entry point with graceful shutdown
```

### Frontend Structure (`frontend/src/`)
```
app/            — 9 App Router pages (landing, dashboard, proposals, vote/[id], admin, members, treasury, history)
components/     — 15+ components: wallet, proposals, voting, synthesis, treasury, layout
hooks/          — useWallet, useProposals, useVoteTally, useTreasury, useAuth
lib/            — api.ts (typed client), sui.ts (PTB builders), enoki.ts (zkLogin init), auth.ts, utils.ts
types/          — Re-exports from @civicnode/shared-types + UI-specific types
```

### Contract Structure (`Contract/`)
```
sources/        — governance.move (core module: community, proposals, voting, treasury)
tests/          — governance_tests.move (6 test scenarios using test_scenario)
scripts/        — deploy_devnet.sh, deploy_mainnet.sh (Sui CLI)
Move.toml       — Package manifest with Sui framework dependency
```

## How to Run This Project

### Prerequisites
- Node.js >= 20
- pnpm >= 9 (`npm install -g pnpm`)
- Docker & Docker Compose (for MongoDB + Redis)
- Sui CLI (for contract development: `cargo install --locked --git https://github.com/MystenLabs/sui.git sui`)

### First-Time Setup
```bash
git clone <repo-url> && cd CivicNode

# Option A: Use setup script
bash scripts/setup.sh

# Option B: Manual
pnpm install
pnpm --filter @civicnode/shared-types build
cp .env.example .env.local
cp Backend/.env.example Backend/.env.local
```

### Configure Environment Variables
Edit `Backend/.env.local` with your actual values:
- `JWT_SECRET` — generate with `openssl rand -hex 32`
- `ANTHROPIC_API_KEY` — get from console.anthropic.com
- `SUI_PACKAGE_ID` — set after deploying contract to testnet
- `SUI_EXECUTOR_PRIVATE_KEY` — your backend executor account key (bech32 or hex)
- `NEXT_PUBLIC_ENOKI_API_KEY` — from https://enoki.mystenlabs.com
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth client ID for zkLogin

### Start Development
```bash
# Start infrastructure
docker compose up -d          # MongoDB on 27017, Redis on 6379

# Start all dev servers
pnpm dev                      # Frontend: http://localhost:3000, Backend: http://localhost:4000

# Or start individually
pnpm --filter frontend dev    # Frontend only
pnpm --filter Backend dev     # Backend only
```

### Contract Development
```bash
cd Contract
sui move build
sui move test
bash scripts/deploy_devnet.sh  # Deploy to testnet
```

### Build & Check
```bash
pnpm build                    # Build all packages
pnpm typecheck                # TypeScript check (0 errors as of initial build)
make test                     # Run backend + contract tests
```

### Using the Makefile
```bash
make dev            # Start dev servers
make build          # Build everything
make typecheck      # TypeScript checks
make docker-up      # Start MongoDB + Redis
make docker-down    # Stop Docker services
make deploy-devnet  # Deploy contracts to Sui testnet
make clean          # Remove build artifacts
```

## Current State

### Fully Built (all TypeScript checks pass with 0 errors)
- **Monorepo**: pnpm workspaces, root configs, Docker Compose, shared types package
- **Backend** (33 source files): Express server, 6 Mongoose models, Zod schemas, JWT auth, Redis rate limiting, Anthropic streaming with XML injection defense, Sui SDK wrapper, SUI/GHS oracle, cron execution service
- **Frontend** (38 source files): Next.js 14 App Router, Tailwind dark theme, SWR hooks, typed API client, SSE streaming consumer, 9 routes, 15+ components, Enoki zkLogin integration
- **Contract** (1 Move file + 2 deploy scripts): governance module (community, proposals, voting, treasury as shared objects), 6 test scenarios
- **DevOps**: GitHub Actions CI (4 parallel jobs), Dockerfiles (multi-stage), Makefile, setup script

### TODOs (search for `// TODO(civicnode):` in codebase)
- Wire up Enoki wallet signTransaction for real on-chain voting (currently simulated tx hash)
- Set up Enoki API key + Google/Twitch Client IDs in production environment
- Deploy Sui contracts to testnet and set SUI_PACKAGE_ID
- Add ESLint configuration for `pnpm lint` to work
- Add test framework (Jest/Vitest) for backend unit tests
- Connect frontend to live backend once both are running
