#!/bin/bash

# Backup script for application data
# Usage: ./scripts/backup.sh

set -e

BACKUP_DIR="/opt/backups/nx-mono-repo"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.tar.gz"

echo "💾 Creating backup..."

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup application data (customize based on your needs)
tar -czf $BACKUP_FILE \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='.next' \
    /opt/nx-mono-repo

echo "✅ Backup created: $BACKUP_FILE"

# Keep only last 7 backups
echo "🧹 Cleaning old backups..."
ls -t $BACKUP_DIR/backup_*.tar.gz | tail -n +8 | xargs -r rm

echo "✅ Backup completed successfully!"

