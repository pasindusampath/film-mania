# 🚀 Get Started Now!

Welcome to your NX Monorepo with CI/CD! This guide will get you up and running in minutes.

## 📁 What You Have

A complete, production-ready monorepo with:
- ✅ Backend API (TypeScript + Node.js/Express)
- ✅ Frontend Web App (TypeScript + Next.js/React)
- ✅ Full TypeScript support with strict typing
- ✅ Docker setup
- ✅ CI/CD pipelines
- ✅ Deployment scripts
- ✅ Complete documentation

## 🏃 Quick Start (3 Steps)

### 1️⃣ Install Dependencies

```bash
# Make sure you're in the project root
cd H:\my\New folder (2)\nx-mono-repo-deployment-test

# Enable Corepack (if not already enabled)
corepack enable

# Install all dependencies (workspaces)
yarn install
```

That's it! Yarn workspaces automatically install dependencies for all apps.

### 2️⃣ Start Development Servers

**Open Terminal 1:**
```bash
yarn api:dev
```
✅ API runs at http://localhost:3000

**Open Terminal 2:**
```bash
yarn web:dev
```
✅ Web runs at http://localhost:3001

### 3️⃣ Open Your Browser

Visit: **http://localhost:3001**

You should see a beautiful application with:
- Gradient purple background
- Item list functionality
- Add item form

🎉 **You're now running locally!**

## 📚 Documentation Index

Here's what each document covers:

### For Getting Started
- **[GET_STARTED.md](GET_STARTED.md)** (This file) - Quick start guide
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide
- **[SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)** - Detailed setup steps

### For Understanding the Project
- **[README.md](README.md)** - Complete project overview
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - What's been created

### For Deployment
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - VPS deployment guide

### For Contributing
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute

## 🎯 What to Do Next

### Option 1: Local Development
1. ✅ Start the servers (see above)
2. ✅ Make changes to code
3. ✅ See live reload in action
4. ✅ Start building features!

### Option 2: Test Docker Locally
```bash
# Build Docker images
yarn docker:build

# Start all services
yarn docker:up

# Access at http://localhost

# Stop when done
yarn docker:down
```

### Option 3: Deploy to VPS
1. **Read [DEPLOYMENT.md](DEPLOYMENT.md)**
2. **Set up your VPS**
3. **Configure GitHub secrets**
4. **Push to deploy!**

## 🗂️ Project Structure

```
nx-mono-repo-deployment-test/
│
├── apps/
│   ├── api/              ← Backend API
│   └── web/              ← Frontend Web App
│
├── libs/
│   └── shared/           ← Shared code
│
├── .github/workflows/    ← CI/CD pipelines
├── docker/               ← Docker configs
├── scripts/              ← Deployment scripts
│
└── Documentation files (*.md)
```

## 💻 Development Commands

```bash
# API Development
yarn api:dev             # Start API in dev mode
yarn api:build           # Build API
yarn api:start           # Start API in production mode

# Web Development
yarn web:dev             # Start web in dev mode
yarn web:build           # Build web for production
yarn web:start           # Start web in production mode

# All Projects
yarn build:all           # Build everything
yarn type-check          # Type check all TypeScript

# Docker
yarn docker:build        # Build Docker images
yarn docker:up           # Start containers
yarn docker:down         # Stop containers
yarn docker:logs         # View logs
```

## 🔍 Testing Your Setup

### 1. Test API
```bash
# In PowerShell or Git Bash
curl http://localhost:3000/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-16T...",
  "uptime": 12.34,
  "environment": "development"
}
```

### 2. Test Web
Open browser to: http://localhost:3001

You should see:
- ✅ "Welcome to NX Monorepo" title
- ✅ Beautiful gradient background
- ✅ Add item form
- ✅ Items list

### 3. Test Integration
1. Go to http://localhost:3001
2. Fill in the form:
   - Name: "Test Item"
   - Description: "Testing the app"
3. Click "Add Item"
4. See the item appear in the list

✅ **If this works, everything is connected!**

## 🐳 Docker Testing

Test the production setup locally:

```bash
# Build everything
npm run docker:build

# Start all services (API + Web + Nginx)
npm run docker:up

# Wait ~30 seconds for startup

# Test in browser
# Open: http://localhost

# View logs
npm run docker:logs

# When done, stop everything
npm run docker:down
```

## 🌐 Deploying to VPS

### Prerequisites
- A VPS (DigitalOcean, AWS, Linode, etc.)
- Ubuntu 20.04+ recommended
- SSH access

### Quick Deploy Steps

1. **Initial VPS Setup**
   ```bash
   ssh your-user@your-vps-ip
   
   # Download and run setup script
   curl -O https://raw.githubusercontent.com/your-username/your-repo/main/scripts/setup-vps.sh
   chmod +x setup-vps.sh
   ./setup-vps.sh
   ```

2. **Configure GitHub Secrets**
   - Go to GitHub repo → Settings → Secrets
   - Add:
     - `VPS_HOST`: Your VPS IP
     - `VPS_USERNAME`: SSH username
     - `VPS_SSH_KEY`: Your private SSH key
     - `VPS_PORT`: 22 (usually)

3. **Deploy**
   ```bash
   git push origin main
   ```
   
   GitHub Actions will automatically deploy! 🚀

### Manual Deploy
```bash
ssh your-user@your-vps-ip
cd /opt/nx-mono-repo
./scripts/deploy.sh
```

## 🆘 Troubleshooting

### Issue: Port already in use
```bash
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (Windows)
taskkill /PID <PID> /F
```

### Issue: npm install fails
```bash
# Clear cache and try again
npm cache clean --force
rm -rf node_modules
npm install
```

### Issue: Can't access localhost:3001
- Check if web server is running
- Look for errors in terminal
- Try: `npm run web:dev` again

### Issue: Items don't load
- Check if API is running on port 3000
- Check browser console for errors
- Verify `API_URL` in web/.env.local

## 📖 Learning Path

1. **Day 1**: Get it running locally (this guide)
2. **Day 2**: Read [README.md](README.md) - understand the architecture
3. **Day 3**: Make small changes, test live reload
4. **Day 4**: Read [DEPLOYMENT.md](DEPLOYMENT.md) - understand deployment
5. **Day 5**: Deploy to VPS!

## 🎨 Customization Ideas

Easy things to try:
1. Change the gradient colors in `apps/web/src/styles/globals.css`
2. Add a new API endpoint in `apps/api/src/routes/api.js`
3. Create a new React component
4. Modify the welcome message

## 🔗 Important Links

- **Frontend**: http://localhost:3001
- **API**: http://localhost:3000
- **API Health**: http://localhost:3000/health
- **API Docs**: http://localhost:3000/api

## 📞 Getting Help

1. **Check the docs** - [README.md](README.md)
2. **Common issues** - [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)
3. **Deployment help** - [DEPLOYMENT.md](DEPLOYMENT.md)
4. **Open an issue** on GitHub

## ✅ Checklist

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] API dependencies installed
- [ ] Web dependencies installed
- [ ] API server running (port 3000)
- [ ] Web server running (port 3001)
- [ ] Can access http://localhost:3001
- [ ] Can add and view items
- [ ] Docker installed (optional)
- [ ] Docker setup tested (optional)

## 🎯 Your Next Steps

Choose your path:

### Path A: Development
1. ✅ Get it running (you're here!)
2. Read [README.md](README.md)
3. Start coding!
4. Make awesome features

### Path B: Deployment
1. ✅ Get it running locally
2. Read [DEPLOYMENT.md](DEPLOYMENT.md)
3. Set up VPS
4. Deploy to production

### Path C: Learning
1. ✅ Get it running
2. Read [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
3. Understand the architecture
4. Read [CONTRIBUTING.md](CONTRIBUTING.md)

## 🎉 Success!

If you can see your app running on http://localhost:3001, congratulations! 

You now have a complete, professional-grade monorepo setup with:
- Modern tech stack
- Development environment
- Production-ready Docker setup
- CI/CD pipeline
- Deployment automation

**Start building something awesome! 🚀**

---

**Questions?** Check [README.md](README.md) or open a GitHub issue.

**Ready to deploy?** Read [DEPLOYMENT.md](DEPLOYMENT.md).

**Want to contribute?** Read [CONTRIBUTING.md](CONTRIBUTING.md).

