#!/bin/bash
set -e

echo "=== CivicNode Setup ==="

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "Node.js is required. Install from https://nodejs.org"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "Installing pnpm..."; npm install -g pnpm; }

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Build shared types
echo "Building shared types..."
pnpm --filter @civicnode/shared-types build

# Copy env files
for dir in . Backend frontend; do
  if [ -f "$dir/.env.example" ] && [ ! -f "$dir/.env.local" ]; then
    cp "$dir/.env.example" "$dir/.env.local"
    echo "Created $dir/.env.local from example"
  fi
done

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Edit .env.local files with your actual values"
echo "2. Run 'docker compose up -d' to start MongoDB and Redis"
echo "3. Run 'pnpm dev' to start development servers"
echo "4. Frontend: http://localhost:3000"
echo "5. Backend:  http://localhost:4000"
echo ""
