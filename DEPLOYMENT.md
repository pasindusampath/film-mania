# Deployment Guide

Complete guide for deploying the NX Monorepo to a VPS.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [VPS Requirements](#vps-requirements)
3. [Initial Setup](#initial-setup)
4. [GitHub Configuration](#github-configuration)
5. [First Deployment](#first-deployment)
6. [SSL/HTTPS Setup](#sslhttps-setup)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- Git
- Docker (20.10.x or higher)
- Docker Compose (2.x or higher)
- SSH access to VPS

### VPS Requirements

**Minimum Specifications:**
- 2 CPU cores
- 2GB RAM
- 20GB storage
- Ubuntu 20.04 LTS or higher

**Recommended Specifications:**
- 4 CPU cores
- 4GB RAM
- 40GB storage
- Ubuntu 22.04 LTS

## Initial Setup

### Step 1: SSH Key Setup

Generate SSH key pair (if you don't have one):

```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
```

Copy public key to VPS:

```bash
ssh-copy-id your-username@your-vps-ip
```

Test connection:

```bash
ssh your-username@your-vps-ip
```

### Step 2: VPS Initial Configuration

Run the automated setup script:

```bash
# Download the setup script
curl -O https://raw.githubusercontent.com/your-repo/main/scripts/setup-vps.sh

# Make it executable
chmod +x setup-vps.sh

# Run the script
./setup-vps.sh
```

This script will:
- Update system packages
- Install Docker and Docker Compose
- Install Git
- Configure firewall (UFW)
- Create application directory

### Step 3: Manual VPS Setup (Alternative)

If you prefer manual setup:

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt-get install -y git

# Create application directory
sudo mkdir -p /opt/nx-mono-repo
sudo chown -R $USER:$USER /opt/nx-mono-repo

# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

### Step 4: Clone Repository

```bash
cd /opt/nx-mono-repo
git clone <your-repository-url> .
```

## GitHub Configuration

### Step 1: Add Repository Secrets

Go to your GitHub repository:
1. Navigate to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**

Add the following secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `VPS_HOST` | VPS IP address or domain | `203.0.113.10` |
| `VPS_USERNAME` | SSH username | `ubuntu` |
| `VPS_SSH_KEY` | SSH private key content | Contents of `~/.ssh/id_ed25519` |
| `VPS_PORT` | SSH port (optional) | `22` |
| `DOCKER_USERNAME` | Docker Hub username (optional) | `yourusername` |
| `DOCKER_PASSWORD` | Docker Hub password (optional) | `your-token` |

### Step 2: Get SSH Private Key

```bash
# Display your private key
cat ~/.ssh/id_ed25519

# Copy the entire output (including BEGIN and END lines)
```

Paste the entire key into the `VPS_SSH_KEY` secret.

## First Deployment

### Option 1: Automated Deployment (GitHub Actions)

Simply push to the main branch:

```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

GitHub Actions will automatically:
1. Build Docker images
2. Deploy to VPS
3. Run health checks

Monitor the deployment in **Actions** tab on GitHub.

### Option 2: Manual Deployment

SSH into your VPS:

```bash
ssh your-username@your-vps-ip
cd /opt/nx-mono-repo
```

Run the deployment script:

```bash
./scripts/deploy.sh
```

### Verify Deployment

1. **Check service status:**
   ```bash
   ./scripts/status.sh
   ```

2. **Check health endpoint:**
   ```bash
   curl http://your-vps-ip/health
   ```

3. **Access web application:**
   Open browser to `http://your-vps-ip`

## SSL/HTTPS Setup

### Option 1: Let's Encrypt (Recommended)

Install Certbot:

```bash
sudo apt-get install -y certbot
```

Generate certificates:

```bash
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com
```

Stop Docker containers first if ports 80/443 are in use:

```bash
docker-compose down
```

Copy certificates to project:

```bash
sudo mkdir -p /opt/nx-mono-repo/docker/nginx/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /opt/nx-mono-repo/docker/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /opt/nx-mono-repo/docker/nginx/ssl/key.pem
sudo chown -R $USER:$USER /opt/nx-mono-repo/docker/nginx/ssl
```

Update nginx.conf:

Uncomment the HTTPS server block in `docker/nginx/nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # ... rest of configuration
}
```

Restart services:

```bash
docker-compose up -d
```

### Option 2: Self-Signed Certificate (Development)

```bash
mkdir -p docker/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout docker/nginx/ssl/key.pem \
  -out docker/nginx/ssl/cert.pem
```

### Auto-renewal Setup

Add cron job for certificate renewal:

```bash
sudo crontab -e
```

Add this line:

```
0 0 * * 0 certbot renew --pre-hook "docker-compose down" --post-hook "docker-compose up -d"
```

## Monitoring

### Application Logs

```bash
# View all logs
./scripts/logs.sh all

# View specific service
./scripts/logs.sh api
./scripts/logs.sh web
./scripts/logs.sh nginx
```

### Service Status

```bash
# Check all services
./scripts/status.sh

# Check individual containers
docker-compose ps

# Check resource usage
docker stats
```

### Health Checks

```bash
# API health
curl http://your-vps-ip/health

# Check if API is ready
curl http://your-vps-ip/health/ready
```

### Setting Up Monitoring (Optional)

For production environments, consider:

1. **Prometheus + Grafana** for metrics
2. **ELK Stack** for log aggregation
3. **Uptime monitoring** services (UptimeRobot, Pingdom)

## Backup and Recovery

### Create Backup

```bash
./scripts/backup.sh
```

Backups are stored in `/opt/backups/nx-mono-repo/`

### Restore from Backup

```bash
# List available backups
ls -lh /opt/backups/nx-mono-repo/

# Extract backup
cd /opt
tar -xzf backups/nx-mono-repo/backup_YYYYMMDD_HHMMSS.tar.gz

# Restart services
cd nx-mono-repo
docker-compose up -d
```

### Automated Backups

Add cron job:

```bash
crontab -e
```

Add this line (daily backup at 2 AM):

```
0 2 * * * /opt/nx-mono-repo/scripts/backup.sh
```

## Rollback

If something goes wrong:

```bash
./scripts/rollback.sh
```

This will show recent commits and let you rollback to any previous version.

## Troubleshooting

### Deployment Failed

1. **Check GitHub Actions logs:**
   - Go to repository → Actions
   - Click on failed workflow
   - Review error messages

2. **Check VPS logs:**
   ```bash
   ssh your-username@your-vps-ip
   cd /opt/nx-mono-repo
   ./scripts/logs.sh all
   ```

3. **Verify SSH connection:**
   ```bash
   ssh -v your-username@your-vps-ip
   ```

### Services Not Starting

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs

# Restart services
docker-compose restart

# Full restart
docker-compose down
docker-compose up -d
```

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :80
sudo lsof -i :443

# Kill process
sudo kill -9 <PID>
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean Docker resources
docker system prune -a -f
docker volume prune -f

# Remove old backups
rm /opt/backups/nx-mono-repo/backup_old*.tar.gz
```

### Memory Issues

```bash
# Check memory usage
free -h

# Restart services to free memory
docker-compose restart

# Add swap space (if needed)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### SSL Certificate Issues

```bash
# Check certificate expiry
sudo certbot certificates

# Force renew
sudo certbot renew --force-renewal

# Test renewal
sudo certbot renew --dry-run
```

## Performance Optimization

### Enable Gzip Compression

Already configured in `nginx.conf`. Verify:

```bash
curl -H "Accept-Encoding: gzip" -I http://your-vps-ip
```

### Docker Resource Limits

Edit `docker-compose.yml` to add resource limits:

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

### Database Optimization (When Added)

- Use connection pooling
- Add indexes
- Enable query caching
- Regular vacuum/optimize

## Security Checklist

- [ ] SSH key authentication enabled
- [ ] Password authentication disabled
- [ ] UFW firewall configured
- [ ] SSL/TLS certificates installed
- [ ] Environment variables secured
- [ ] Regular security updates enabled
- [ ] Rate limiting configured in Nginx
- [ ] Non-root Docker containers
- [ ] Regular backups scheduled
- [ ] Monitoring and alerts set up

## Updating the Application

### Regular Updates

```bash
cd /opt/nx-mono-repo
git pull origin main
docker-compose down
docker-compose build
docker-compose up -d
```

### Zero-Downtime Deployment

For production, consider:
1. Blue-green deployment
2. Rolling updates
3. Load balancer with multiple instances

## Support and Maintenance

### Regular Maintenance Tasks

**Daily:**
- Monitor application logs
- Check service health

**Weekly:**
- Review resource usage
- Check disk space
- Verify backups

**Monthly:**
- Update system packages
- Review security logs
- Update SSL certificates (if needed)
- Clean up Docker resources

### Getting Help

1. Check logs: `./scripts/logs.sh all`
2. Check status: `./scripts/status.sh`
3. Review GitHub Actions logs
4. Check this documentation
5. Open GitHub issue

---

**Need more help?** Open an issue on GitHub or contact the maintainers.

