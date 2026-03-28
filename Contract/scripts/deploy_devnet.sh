#!/bin/bash
set -e
echo "Compiling Move modules..."
sui move build
echo "Running tests..."
sui move test
echo "Publishing to devnet..."
sui client publish --gas-budget 100000000
echo "Deployed successfully to devnet!"
echo "Copy the Package ID from the output above and set it as SUI_PACKAGE_ID in your .env"
