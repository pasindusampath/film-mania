#!/bin/bash

# Deployment script for VPS
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
COMPOSE_FILE="docker-compose.yml"

echo "🚀 Starting deployment to $ENVIRONMENT environment..."

# Pull latest code
echo "📥 Pulling latest code from git..."
git pull origin main

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f $COMPOSE_FILE down

# Build new images
echo "🔨 Building new Docker images..."
docker-compose -f $COMPOSE_FILE build --no-cache

# Start containers
echo "▶️  Starting containers..."
docker-compose -f $COMPOSE_FILE up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Health check
echo "🏥 Running health checks..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ API health check passed"
else
    echo "❌ API health check failed"
    exit 1
fi

# Clean up old images
echo "🧹 Cleaning up old Docker images..."
docker system prune -f

echo "✅ Deployment completed successfully!"
echo "🌐 Application is running at http://localhost"

