# CivicNode — AI-powered community governance platform for Ghana
# Usage: make <target>

.PHONY: dev build test lint typecheck docker-up docker-down deploy-devnet setup clean

# Start frontend and backend dev servers in parallel
dev:
	pnpm dev

# Production build for all packages
build:
	pnpm build

# Run backend unit tests and Move contract tests
test:
	pnpm --filter Backend test
	cd Contract && aptos move test --named-addresses civicnode=0x1

# Lint all packages
lint:
	pnpm lint

# Type-check all packages
typecheck:
	pnpm typecheck

# Start Docker services (MongoDB, Redis)
docker-up:
	docker compose up -d

# Stop Docker services
docker-down:
	docker compose down

# Deploy Move contracts to Aptos devnet
deploy-devnet:
	cd Contract && bash scripts/deploy_devnet.sh

# First-time project setup
setup:
	bash scripts/setup.sh

# Remove generated artifacts and dependency caches
clean:
	rm -rf node_modules
	rm -rf Backend/node_modules Backend/dist
	rm -rf frontend/node_modules frontend/.next frontend/out
	rm -rf shared-types/node_modules shared-types/dist
	echo "Cleaned all build artifacts and node_modules"
