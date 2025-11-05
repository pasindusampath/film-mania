#!/bin/bash

# View logs from Docker containers
# Usage: ./scripts/logs.sh [service]

SERVICE=${1:-all}

echo "📜 Viewing logs for: $SERVICE"

if [ "$SERVICE" = "all" ]; then
    docker-compose logs -f --tail=100
elif [ "$SERVICE" = "api" ]; then
    docker-compose logs -f --tail=100 api
elif [ "$SERVICE" = "web" ]; then
    docker-compose logs -f --tail=100 web
elif [ "$SERVICE" = "nginx" ]; then
    docker-compose logs -f --tail=100 nginx
else
    echo "❌ Unknown service: $SERVICE"
    echo "Available services: all, api, web, nginx"
    exit 1
fi

