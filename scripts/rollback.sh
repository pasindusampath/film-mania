#!/bin/bash

# Rollback script to revert to previous deployment
# Usage: ./scripts/rollback.sh

set -e

echo "⏮️  Rolling back to previous version..."

# Go to previous git commit
git log --oneline -10
read -p "Enter the commit hash to rollback to: " COMMIT_HASH

if [ -z "$COMMIT_HASH" ]; then
    echo "❌ No commit hash provided. Aborting."
    exit 1
fi

# Checkout the specified commit
git checkout $COMMIT_HASH

# Deploy the previous version
./scripts/deploy.sh

echo "✅ Rollback completed successfully!"

