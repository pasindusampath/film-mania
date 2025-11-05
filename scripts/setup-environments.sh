#!/bin/bash

# Multi-Environment Setup Script
# This script helps set up all environment configurations

set -e

echo "🚀 Multi-Environment Setup Script"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to create .env file
create_env_file() {
    local env=$1
    local port=$2
    local db_name=$3
    local file_path="apps/api/.env.$env"
    
    echo -e "${YELLOW}Creating $file_path...${NC}"
    
    cat > "$file_path" << EOF
# $env Environment Configuration
NODE_ENV=$env
PORT=$port

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$db_name
DB_USER=postgres
DB_PASSWORD=your_password_here

# Add other environment-specific variables below
EOF
    
    echo -e "${GREEN}✓ Created $file_path${NC}"
}

# Check if apps/api directory exists
if [ ! -d "apps/api" ]; then
    echo -e "${RED}Error: apps/api directory not found!${NC}"
    echo "Please run this script from the project root."
    exit 1
fi

echo "This script will create environment configuration files."
echo ""
read -p "Do you want to continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo "Creating environment files..."
echo ""

# Create Dev environment file
create_env_file "dev" "3000" "nx_monorepo_dev"

# Create QA environment file
create_env_file "qa" "3001" "nx_monorepo_qa"

# Create Staging environment file
create_env_file "staging" "3002" "nx_monorepo_staging"

# Create Production environment file
create_env_file "prod" "3009" "nx_monorepo_prod"

echo ""
echo -e "${GREEN}✅ Environment files created successfully!${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Please update the database credentials in each file:${NC}"
echo "   - apps/api/.env.dev"
echo "   - apps/api/.env.qa"
echo "   - apps/api/.env.staging"
echo "   - apps/api/.env.prod"
echo ""
echo -e "${YELLOW}⚠️  Remember to add these secrets to GitHub:${NC}"
echo ""
echo "For each environment (dev, qa, staging, production), add:"
echo "   - [ENV]_DB_HOST"
echo "   - [ENV]_DB_PORT"
echo "   - [ENV]_DB_NAME"
echo "   - [ENV]_DB_USER"
echo "   - [ENV]_DB_PASSWORD"
echo ""
echo "Plus common secrets:"
echo "   - VPS_HOST"
echo "   - VPS_USERNAME"
echo "   - VPS_SSH_KEY"
echo "   - VPS_PORT"
echo ""
echo -e "${GREEN}✅ Setup complete! Check the documentation for next steps.${NC}"
echo "📖 See: docs/MULTI_ENVIRONMENT_DEPLOYMENT.md"

