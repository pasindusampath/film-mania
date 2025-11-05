#!/bin/bash

# VPS Setup Script for NX Monorepo Deployment
# Run this script on your VPS to prepare it for CI/CD deployments

set -e  # Exit on any error

echo "🚀 Starting VPS Setup for NX Monorepo..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"  # Update this!
DEPLOY_DIR="/opt/nx-mono-repo"
CURRENT_USER=$(whoami)

echo -e "${YELLOW}Current user: $CURRENT_USER${NC}"

# Function to check if running as root
check_root() {
    if [ "$EUID" -eq 0 ]; then 
        echo -e "${RED}Please do not run this script as root${NC}"
        echo "Run as your regular user. The script will use sudo when needed."
        exit 1
    fi
}

# Update system
update_system() {
    echo -e "${GREEN}[1/7] Updating system packages...${NC}"
    sudo apt update
    sudo apt upgrade -y
}

# Install Docker
install_docker() {
    echo -e "${GREEN}[2/7] Installing Docker...${NC}"
    
    if command -v docker &> /dev/null; then
        echo "Docker already installed, skipping..."
        docker --version
        return
    fi
    
    # Install prerequisites
    sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io
    
    echo "Docker installed successfully!"
    docker --version
}

# Install Docker Compose
install_docker_compose() {
    echo -e "${GREEN}[3/7] Installing Docker Compose...${NC}"
    
    if command -v docker-compose &> /dev/null; then
        echo "Docker Compose already installed, skipping..."
        docker-compose --version
        return
    fi
    
    # Install Docker Compose plugin
    sudo apt install -y docker-compose-plugin
    
    # Also install standalone for compatibility
    DOCKER_COMPOSE_VERSION="v2.24.0"
    sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    echo "Docker Compose installed successfully!"
    docker-compose --version
}

# Add user to docker group
setup_docker_permissions() {
    echo -e "${GREEN}[4/7] Setting up Docker permissions...${NC}"
    
    # Add current user to docker group
    sudo usermod -aG docker $CURRENT_USER
    
    echo -e "${YELLOW}User $CURRENT_USER added to docker group${NC}"
    echo -e "${YELLOW}You may need to log out and back in for this to take effect${NC}"
    
    # Change Docker socket permissions (temporary fix)
    sudo chmod 666 /var/run/docker.sock
}

# Install Git
install_git() {
    echo -e "${GREEN}[5/7] Installing Git...${NC}"
    
    if command -v git &> /dev/null; then
        echo "Git already installed, skipping..."
        git --version
        return
    fi
    
    sudo apt install -y git
    git --version
}

# Clone repository
clone_repository() {
    echo -e "${GREEN}[6/7] Setting up deployment directory...${NC}"
    
    # Check if REPO_URL is still the default
    if [[ "$REPO_URL" == *"YOUR_USERNAME"* ]]; then
        echo -e "${RED}ERROR: Please update REPO_URL in this script first!${NC}"
        echo "Edit this script and replace:"
        echo "  REPO_URL=\"https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git\""
        echo "with your actual repository URL"
        exit 1
    fi
    
    # Create deployment directory
    if [ -d "$DEPLOY_DIR" ]; then
        echo "Directory $DEPLOY_DIR already exists"
        read -p "Do you want to remove it and clone fresh? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo rm -rf $DEPLOY_DIR
        else
            echo "Skipping repository clone..."
            return
        fi
    fi
    
    # Clone repository
    sudo mkdir -p $DEPLOY_DIR
    sudo chown $CURRENT_USER:$CURRENT_USER $DEPLOY_DIR
    git clone $REPO_URL $DEPLOY_DIR
    
    echo -e "${GREEN}Repository cloned to $DEPLOY_DIR${NC}"
}

# Create npm_network for Nginx Proxy Manager
create_docker_network() {
    echo -e "${GREEN}[7/7] Creating Docker network for Nginx Proxy Manager...${NC}"
    
    # Check if network exists
    if docker network ls | grep -q npm_network; then
        echo "Network npm_network already exists, skipping..."
    else
        docker network create npm_network
        echo -e "${GREEN}Network npm_network created successfully!${NC}"
    fi
}

# Setup firewall (optional)
setup_firewall() {
    echo -e "${YELLOW}Setting up firewall (UFW)...${NC}"
    
    read -p "Do you want to configure firewall? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        return
    fi
    
    sudo apt install -y ufw
    
    # Allow SSH
    sudo ufw allow OpenSSH
    
    # Allow HTTP and HTTPS (for Nginx Proxy Manager)
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    # Allow custom ports (optional, for direct access during development)
    read -p "Allow direct access to ports 3008 and 3009? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo ufw allow 3008/tcp
        sudo ufw allow 3009/tcp
    fi
    
    # Enable firewall
    sudo ufw --force enable
    sudo ufw status
}

# Main execution
main() {
    check_root
    
    echo "=================================="
    echo "  VPS Setup for NX Monorepo"
    echo "=================================="
    echo ""
    
    update_system
    install_docker
    install_docker_compose
    setup_docker_permissions
    install_git
    clone_repository
    create_docker_network
    setup_firewall
    
    echo ""
    echo "=================================="
    echo -e "${GREEN}✅ VPS Setup Complete!${NC}"
    echo "=================================="
    echo ""
    echo "📋 Next Steps:"
    echo ""
    echo "1. LOG OUT AND BACK IN for Docker permissions to take effect:"
    echo "   exit"
    echo "   ssh $CURRENT_USER@your-vps-ip"
    echo ""
    echo "2. Test Docker access:"
    echo "   docker ps"
    echo ""
    echo "3. Navigate to deployment directory:"
    echo "   cd $DEPLOY_DIR"
    echo ""
    echo "4. Start the services:"
    echo "   docker-compose up -d --build"
    echo ""
    echo "5. Check the logs:"
    echo "   docker-compose logs -f"
    echo ""
    echo "6. Set up GitHub Actions secrets:"
    echo "   VPS_HOST: Your VPS IP"
    echo "   VPS_USERNAME: $CURRENT_USER"
    echo "   VPS_SSH_KEY: Your CI/CD SSH private key"
    echo "   VPS_PORT: 22 (or your SSH port)"
    echo ""
    echo "7. In Nginx Proxy Manager, create proxy hosts:"
    echo "   API: nx-api:3009"
    echo "   Web: nx-web:3008"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Remember to log out and back in!${NC}"
    echo ""
}

# Run main function
main
