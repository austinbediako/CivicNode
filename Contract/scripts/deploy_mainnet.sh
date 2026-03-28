#!/bin/bash
set -e
echo "=== MAINNET DEPLOYMENT ==="
echo "This will deploy to MAINNET. Are you sure? (yes/no)"
read confirmation
if [ "$confirmation" != "yes" ]; then
    echo "Deployment cancelled."
    exit 1
fi
echo "Compiling Move modules..."
sui move build
echo "Running tests..."
sui move test
echo "Publishing to mainnet..."
sui client publish --gas-budget 200000000
echo "Deployed successfully to mainnet!"
echo "Copy the Package ID from the output above and set it as SUI_PACKAGE_ID in your .env"
