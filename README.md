# CivicNode

CivicNode is a web3-powered platform designed for civic engagement, decentralized governance, and community interaction. It features a robust monorepo architecture with a multi-layered stack including smart contracts, a dedicated backend service, and a modern frontend application.

## 📁 Repository Structure

```text
CivicNode/
├── 📂 Backend/                # Node.js/TypeScript Backend Service
│   ├── 📂 src/
│   │   ├── 📂 config/         # Configuration & Environment Setup
│   │   ├── 📂 controllers/    # Request Handlers
│   │   ├── 📂 middleware/     # Express Middleware (Auth, Logging)
│   │   ├── 📂 models/         # Database Models & Entities
│   │   ├── 📂 routes/         # API Route Definitions
│   │   ├── 📂 schemas/        # Data Validation (Zod/Joi)
│   │   ├── 📂 services/       # Core Business Logic
│   │   ├── 📄 app.ts          # Application Configuration
│   │   └── 📄 server.ts       # Service Entry Point
│   ├── 🐋 Dockerfile          # Backend Containerization
│   └── 📦 package.json        # Service Dependencies
│
├── 📂 Contract/               # Move Smart Contracts (Aptos/Sui)
│   ├── 📂 sources/            # Smart Contract Source Code (.move)
│   ├── 📂 scripts/            # Deployment & Maintenance Scripts
│   ├── 📂 tests/              # Move Unit & Integration Tests
│   └── 📄 Move.toml           # Move Package Manifest
│
├── 📂 frontend/               # Next.js Frontend Application
│   ├── 📂 src/
│   │   ├── 📂 app/            # Next.js App Router (Pages & Layouts)
│   │   ├── 📂 components/     # Reusable UI Components
│   │   ├── 📂 hooks/          # Custom React Hooks (Web3/State)
│   │   ├── 📂 lib/            # Shared Utilities & Clients
│   │   ├── 📂 providers/      # Context Providers (Wagmi, Auth)
│   │   ├── 📂 types/          # TypeScript Type Definitions
│   │   └── 📄 wagmi.ts        # Web3 & Wallet Configuration
│   ├── 🐋 Dockerfile          # Frontend Containerization
│   └── 📦 package.json        # Frontend Dependencies
│
├── 📂 packages/               # Shared Workspace Packages
│   └── 📂 shared-types/       # Common TypeScript Interface & Types
│
├── 📂 scripts/                # Root-level Automation Scripts
├── 📂 .github/                # CI/CD Workflows (GitHub Actions)
├── 🐳 docker-compose.yml      # Local Multi-Service Orchestration
├── 🛠️ Makefile               # Common Task Automation
├── 📦 package.json            # Workspace Configuration (PNPM)
└── 📄 README.md               # Project Documentation
```

## Getting Started

1. **Pre-requisites**: Ensure you have `pnpm`, `docker`, and the `Aptos/Sui CLI` installed.
2. **Setup**: Run `pnpm install` at the root to set up all workspace dependencies.
3. **Local Development**: Use the `Makefile` or `docker-compose.yml` to spin up local environments.

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Wagmi
- **Backend**: Node.js, Express, TypeScript, Zod
- **Smart Contracts**: Move Language
- **Package Manager**: PNPM Workspaces
- **Containerization**: Docker & Docker Compose
