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
aptos move compile --named-addresses civicnode=default
echo "Running tests..."
aptos move test --named-addresses civicnode=default
echo "Publishing to mainnet..."
aptos move publish --named-addresses civicnode=default --profile mainnet --assume-yes
echo "Deployed successfully to mainnet!"
