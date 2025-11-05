# Quick Start Guide

Get up and running in 5 minutes!

## 🚀 For Local Development

### 1. Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd nx-mono-repo-deployment-test

# Install root dependencies
npm install

# Install app dependencies
cd apps/api && npm install && cd ../..
cd apps/web && npm install && cd ../..
```

Or use the shortcut:

```bash
npm run install:all
```

### 2. Start Development Servers

**Terminal 1 - API Server:**
```bash
npm run api:dev
```

**Terminal 2 - Web Server:**
```bash
npm run web:dev
```

### 3. Access Your Applications

- **Web App**: http://localhost:3001
- **API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

That's it! You're ready to develop! 🎉

## 🐳 For Docker Testing

Test the production Docker setup locally:

```bash
# Build and start all services
npm run docker:build
npm run docker:up

# Access at http://localhost

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

## 🌐 For VPS Deployment

### One-Time Setup

1. **Prepare your VPS:**
   ```bash
   # SSH into your VPS
   ssh your-username@your-vps-ip
   
   # Run setup script
   curl -O https://raw.githubusercontent.com/your-repo/main/scripts/setup-vps.sh
   chmod +x setup-vps.sh
   ./setup-vps.sh
   ```

2. **Configure GitHub Secrets:**
   - Go to GitHub repo → Settings → Secrets
   - Add: `VPS_HOST`, `VPS_USERNAME`, `VPS_SSH_KEY`, `VPS_PORT`

3. **Deploy:**
   ```bash
   git push origin main
   ```

GitHub Actions will automatically deploy!

### Manual Deployment

```bash
# SSH into VPS
ssh your-username@your-vps-ip

# Navigate to app directory
cd /opt/nx-mono-repo

# Deploy
./scripts/deploy.sh
```

## 📋 Common Tasks

```bash
# Check service status
npm run status

# View logs
npm run logs

# Create backup
./scripts/backup.sh

# Rollback deployment
./scripts/rollback.sh
```

## 🎯 Next Steps

- Read the [full README](README.md) for detailed information
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment details
- See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute

## ❓ Need Help?

- Check if services are running: `npm run status`
- View logs: `npm run logs`
- Open an issue on GitHub

---

**Happy coding! 🚀**

