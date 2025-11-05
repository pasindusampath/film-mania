# Setup Instructions

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Development Setup](#development-setup)
4. [VPS Setup](#vps-setup)
5. [GitHub Setup](#github-setup)
6. [Verification](#verification)

## Prerequisites

### Required Software

- **Node.js**: Version 18.x or higher ([Download](https://nodejs.org/))
- **npm**: Comes with Node.js
- **Git**: ([Download](https://git-scm.com/))
- **Docker**: For containerization ([Download](https://www.docker.com/))
- **Docker Compose**: Usually comes with Docker Desktop

### Optional Tools

- **Visual Studio Code**: Recommended IDE
- **Git Bash**: For Windows users (comes with Git)
- **Postman**: For API testing

## Initial Setup

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd nx-mono-repo-deployment-test
```

### Step 2: Verify Installation

Check that all required tools are installed:

```bash
# Check Node.js
node --version  # Should be 18.x or higher

# Check npm
npm --version

# Check Git
git --version

# Check Docker
docker --version

# Check Docker Compose
docker-compose --version
```

## Development Setup

### Step 1: Install Dependencies

**Option A: Install All at Once (Recommended)**
```bash
npm install
cd apps/api && npm install && cd ../..
cd apps/web && npm install && cd ../..
```

**Option B: Use the Script (if available)**
```bash
npm run install:all
```

### Step 2: Create Environment Files

**For API (apps/api/.env):**
```env
NODE_ENV=development
PORT=3000
```

**For Web (apps/web/.env.local):**
```env
API_URL=http://localhost:3000
```

### Step 3: Start Development Servers

Open two terminal windows:

**Terminal 1 - API Server:**
```bash
npm run api:dev
```

**Terminal 2 - Web Server:**
```bash
npm run web:dev
```

### Step 4: Verify Setup

Visit these URLs:
- Frontend: http://localhost:3001
- API: http://localhost:3000
- Health Check: http://localhost:3000/health

You should see:
- ✅ Frontend loads with gradient background
- ✅ API returns JSON response
- ✅ Health endpoint shows "healthy" status

## VPS Setup

### Step 1: Prepare Your VPS

**Minimum Requirements:**
- Ubuntu 20.04 LTS or higher
- 2 CPU cores
- 2GB RAM
- 20GB storage
- SSH access

**Recommended:**
- Ubuntu 22.04 LTS
- 4 CPU cores
- 4GB RAM
- 40GB storage

### Step 2: Connect to VPS

```bash
ssh your-username@your-vps-ip
```

If this is your first time:
```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
ssh-copy-id your-username@your-vps-ip
```

### Step 3: Run VPS Setup Script

**Method 1: Download and Run**
```bash
curl -O https://raw.githubusercontent.com/your-username/your-repo/main/scripts/setup-vps.sh
chmod +x setup-vps.sh
./setup-vps.sh
```

**Method 2: Manual Setup**

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt-get install -y git

# Create app directory
sudo mkdir -p /opt/nx-mono-repo
sudo chown -R $USER:$USER /opt/nx-mono-repo

# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

### Step 4: Clone Repository on VPS

```bash
cd /opt/nx-mono-repo
git clone <your-repository-url> .
```

## GitHub Setup

### Step 1: Create GitHub Repository

1. Go to GitHub.com
2. Click "New Repository"
3. Name it (e.g., "nx-mono-repo-deployment")
4. Create repository
5. Push your code:

```bash
git remote add origin https://github.com/your-username/your-repo.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

### Step 2: Configure GitHub Secrets

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

Add these secrets:

| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `VPS_HOST` | Your VPS IP or domain | From VPS provider |
| `VPS_USERNAME` | SSH username | Usually `root` or `ubuntu` |
| `VPS_SSH_KEY` | Private SSH key | `cat ~/.ssh/id_ed25519` |
| `VPS_PORT` | SSH port | Usually `22` |

**Getting SSH Private Key:**
```bash
# On your local machine
cat ~/.ssh/id_ed25519

# Copy the ENTIRE output including:
# -----BEGIN OPENSSH PRIVATE KEY-----
# ...
# -----END OPENSSH PRIVATE KEY-----
```

### Step 3: Test GitHub Actions

1. Make a small change:
   ```bash
   echo "# Test" >> README.md
   git add .
   git commit -m "Test deployment"
   git push origin main
   ```

2. Go to **Actions** tab on GitHub
3. Watch the workflow run
4. Verify deployment succeeds

## Verification

### Local Development Verification

1. **API Check:**
   ```bash
   curl http://localhost:3000/health
   # Should return: {"status":"healthy",...}
   ```

2. **Web Check:**
   - Open http://localhost:3001
   - Should see beautiful gradient UI
   - Try adding an item
   - Check if items load from API

3. **Docker Check:**
   ```bash
   npm run docker:build
   npm run docker:up
   curl http://localhost/health
   npm run docker:down
   ```

### VPS Deployment Verification

1. **SSH into VPS:**
   ```bash
   ssh your-username@your-vps-ip
   cd /opt/nx-mono-repo
   ```

2. **Check Services:**
   ```bash
   ./scripts/status.sh
   ```

3. **Check Health:**
   ```bash
   curl http://localhost/health
   ```

4. **Check from Browser:**
   - Open http://your-vps-ip
   - Should see your application

### GitHub Actions Verification

1. **Check Workflow Status:**
   - Go to GitHub → Actions
   - All workflows should be green ✅

2. **Test Auto Deployment:**
   - Make a change
   - Push to main
   - Watch automatic deployment

## Troubleshooting

### Issue: Node.js Version Too Old

```bash
# Install Node 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Issue: Docker Permission Denied

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in, then:
docker ps
```

### Issue: Port Already in Use

```bash
# Find what's using the port
sudo lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Issue: Can't Connect to VPS

```bash
# Check SSH configuration
ssh -v your-username@your-vps-ip

# Check if port 22 is open
telnet your-vps-ip 22
```

### Issue: GitHub Actions Failing

1. Check GitHub Actions logs
2. Verify all secrets are set correctly
3. Check VPS SSH access manually
4. Review workflow file syntax

## Next Steps

After successful setup:

1. ✅ Read [README.md](README.md) for full documentation
2. ✅ Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment details
3. ✅ Review [QUICKSTART.md](QUICKSTART.md) for quick reference
4. ✅ Read [CONTRIBUTING.md](CONTRIBUTING.md) if contributing
5. ✅ Start building your features!

## Getting Help

If you encounter issues:

1. Check this document
2. Review [README.md](README.md)
3. Check GitHub Actions logs
4. Run `./scripts/status.sh` on VPS
5. View logs with `./scripts/logs.sh`
6. Open a GitHub issue

## Checklist

Use this checklist to ensure everything is set up:

### Local Setup
- [ ] Node.js 18.x installed
- [ ] npm installed
- [ ] Git installed
- [ ] Docker installed
- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] API runs on :3000
- [ ] Web runs on :3001
- [ ] Can access both applications

### VPS Setup
- [ ] VPS provisioned
- [ ] SSH access working
- [ ] Docker installed on VPS
- [ ] Repository cloned on VPS
- [ ] Firewall configured
- [ ] Can deploy manually

### GitHub Setup
- [ ] Repository created
- [ ] Code pushed to GitHub
- [ ] GitHub secrets configured
- [ ] Workflows enabled
- [ ] Auto deployment works

### Production Ready
- [ ] Application accessible on VPS
- [ ] Health checks passing
- [ ] Nginx reverse proxy working
- [ ] SSL certificate (optional)
- [ ] Monitoring set up
- [ ] Backups configured

---

**Congratulations! You're all set up! 🎉**

Start building amazing things with your NX Monorepo!

