#!/bin/bash
set -e
echo "Compiling Move modules..."
aptos move compile --named-addresses civicnode=default
echo "Running tests..."
aptos move test --named-addresses civicnode=default
echo "Publishing to devnet..."
aptos move publish --named-addresses civicnode=default --profile devnet --assume-yes
echo "Deployed successfully to devnet!"
