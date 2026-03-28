# CivicNode

AI-powered community governance on the Sui blockchain. Transform community discussions into actionable on-chain proposals, vote transparently, and manage shared treasury with full accountability.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend   │────▶│  Sui Network │
│  Next.js 14  │     │  Express.js │     │   (testnet)  │
│  dApp Kit    │     │  MongoDB    │     │  Move smart  │
│  Enoki/      │     │  Anthropic  │     │  contracts   │
│  zkLogin     │     │  AI Engine  │     └──────────────┘
└─────────────┘     └─────────────┘
```

| Layer | Stack |
|-------|-------|
| **Frontend** | Next.js 14, React, TailwindCSS, `@mysten/dapp-kit`, `@mysten/enoki` |
| **Backend** | Express.js, TypeScript, MongoDB, `@mysten/sui` |
| **AI** | Anthropic Claude (SSE streaming synthesis) |
| **Blockchain** | Sui Move smart contracts, Enoki zkLogin (Google OAuth) |
| **Shared** | `@civicnode/shared-types` — TypeScript types shared across packages |

## Key Features

- **zkLogin Auth** — Sign in with Google via Enoki. No wallet extension needed.
- **AI Synthesis** — Upload community chat logs, AI synthesizes them into structured proposals (SSE streaming).
- **On-chain Voting** — Build, sign, and execute Sui transactions for proposal votes.
- **Treasury Management** — View SUI and GHS balances, transaction history with Suiscan explorer links.
- **Role-based Access** — Admin panel for proposal management, member management, and AI synthesis.
- **Audit History** — Full on-chain audit log of all proposals and votes.

## Prerequisites

- **Node.js** >= 18
- **pnpm** >= 8
- **MongoDB** running locally or a connection URI
- **Google Cloud Console** project with OAuth 2.0 credentials (for zkLogin)
- **Mysten Enoki** API key (from [enoki.mystenlabs.com](https://enoki.mystenlabs.com))

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy the example and fill in your values:

```bash
cp .env.local.example .env.local
```

**Root `.env.local`** — Backend variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/civicnode

# Authentication
JWT_SECRET=<generate-a-random-64-char-hex-string>

# AI
ANTHROPIC_API_KEY=<your-anthropic-api-key>
ANTHROPIC_MODEL=claude-sonnet-4-6

# Blockchain (Sui)
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
SUI_PACKAGE_ID=<your-deployed-package-id>
SUI_EXECUTOR_PRIVATE_KEY=<sui-private-key-for-backend-tx-execution>

# Backend Server
PORT=4000
CORS_ORIGIN=http://localhost:3001
NODE_ENV=development
```

**`frontend/.env.local`** — Frontend variables (Next.js reads from its own directory):

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_SUI_PACKAGE_ID=<your-deployed-package-id>

# Enoki zkLogin (Google OAuth)
NEXT_PUBLIC_ENOKI_API_KEY=<your-enoki-api-key>
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
```

### 3. Configure Google OAuth (required for zkLogin)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create or select a project
3. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Add **Authorized JavaScript origins**:
   - `http://localhost:3001` (development)
   - Your production domain
6. Add **Authorized redirect URIs**:
   - `http://localhost:3001` (development)
   - Your production domain
7. Copy the **Client ID** into `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

> **Important:** The Google Client ID must also be registered in your [Enoki dashboard](https://enoki.mystenlabs.com) under your project's OAuth providers.

### 4. Configure Enoki

1. Go to [enoki.mystenlabs.com](https://enoki.mystenlabs.com)
2. Create a project
3. Add Google as an OAuth provider with your Google Client ID
4. Copy the **Enoki API Key** into `NEXT_PUBLIC_ENOKI_API_KEY`
5. Set the network to `testnet` (or `mainnet` for production)

### 5. Run the application

```bash
# Terminal 1 — Backend
pnpm --filter Backend dev

# Terminal 2 — Frontend
pnpm --filter frontend dev
```

- Frontend: http://localhost:3001
- Backend API: http://localhost:4000

### 6. Typecheck

```bash
pnpm -r typecheck
```

## Project Structure

```
CivicNode/
├── frontend/              # Next.js 14 app
│   ├── src/
│   │   ├── app/           # Pages (dashboard, proposals, treasury, admin, vote)
│   │   ├── components/    # React components
│   │   │   ├── AuthProvider.tsx    # JWT auth after wallet connect
│   │   │   ├── auth/AuthGuard.tsx  # Route protection
│   │   │   ├── wallet/            # WalletModal, WalletBadge
│   │   │   ├── voting/            # VoteButtons, VoteTallyBar
│   │   │   ├── synthesis/         # UploadZone, SynthesisStream, DraftEditor
│   │   │   ├── proposals/         # ProposalCard, ProposalDetail
│   │   │   ├── treasury/          # TreasuryBalance, TransactionList
│   │   │   └── layout/            # Header, Sidebar, PageWrapper
│   │   ├── hooks/         # useWallet, useAuth, useProposals, useTreasury
│   │   ├── lib/           # API client, auth helpers, Sui tx builders, utils
│   │   └── types/         # Frontend-specific types
│   └── .env.local         # Frontend env vars (NEXT_PUBLIC_*)
│
├── Backend/               # Express.js API
│   ├── src/
│   │   ├── controllers/   # Auth, proposals, synthesis, treasury
│   │   ├── middleware/     # JWT auth, rate limiting
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API routes
│   │   └── services/      # Sui blockchain, AI synthesis
│   └── .env               # Backend env vars
│
├── Contract/              # Sui Move smart contracts
│   └── sources/
│       └── governance.move  # On-chain governance module
│
├── packages/
│   └── shared-types/      # Shared TypeScript types
│
└── .env.local             # Root env (backend reads from here)
```

## Auth Flow

```
User clicks "Sign in with Google"
  → Enoki opens Google OAuth popup
  → User authenticates with Google
  → Enoki assigns a Sui address via zkLogin
  → dApp Kit connects the wallet
  → AuthProvider detects new account
  → Signs a personal message (automatic, no popup)
  → Sends signature to backend POST /auth/verify
  → Backend verifies signature, issues JWT
  → JWT stored in cookie, attached to all API requests
```

## Smart Contract

The Move contract at `Contract/sources/governance.move` implements:

- **Community** — Create and manage governance communities
- **Proposals** — Create, vote on, and execute proposals
- **Treasury** — On-chain community fund management
- **AdminCap** — Role-based admin access control

Deploy to testnet:

```bash
sui client publish --gas-budget 100000000
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/verify` | No | Verify wallet signature, get JWT |
| GET | `/proposals` | JWT | List proposals (paginated, filterable) |
| GET | `/proposals/:id` | JWT | Get proposal detail |
| POST | `/proposals/synthesize` | JWT+Admin | Upload chat log, stream AI synthesis |
| POST | `/proposals/:id/publish` | JWT+Admin | Publish a draft proposal |
| POST | `/votes` | JWT | Record a vote (with tx hash) |
| GET | `/treasury/:communityId` | JWT | Get treasury balances and history |
| GET | `/members` | JWT+Admin | List community members |

## Partners

- **Anthropic** — AI-powered proposal synthesis
- **University of Ghana** — Governance research partner
- **Republic of Ghana** — Civic engagement pilot

## License

MIT
