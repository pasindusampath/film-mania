#!/bin/bash

# Check status of all services
# Usage: ./scripts/status.sh

echo "📊 Checking service status..."
echo ""

# Docker containers status
echo "🐳 Docker Containers:"
docker-compose ps

echo ""
echo "💾 Disk Usage:"
df -h /

echo ""
echo "🧠 Memory Usage:"
free -h

echo ""
echo "🏥 Health Checks:"

# API health check
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ API: Healthy"
else
    echo "❌ API: Unhealthy"
fi

# Web health check
if curl -f http://localhost > /dev/null 2>&1; then
    echo "✅ Web: Healthy"
else
    echo "❌ Web: Unhealthy"
fi

echo ""
echo "📈 Container Stats:"
docker stats --no-stream

