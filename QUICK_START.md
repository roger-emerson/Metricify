# Metricify v1.0.1 - Quick Start Guide

**3-Minute Setup for Development**

---

## Prerequisites

- Docker installed (or Node.js 20+)
- Spotify Developer Account
- EDMTrain API Key (apply at https://edmtrain.com/api-documentation)

---

## 🚀 Easiest Way - Choose Your Path

### Option 1: Full Docker (Everything Containerized)

```bash
# Start EVERYTHING in Docker with one command!
make prod
# OR
docker-compose up -d --build
```

**Then initialize database (first time only):**
```bash
make db-init
# OR
docker exec metricify-app npm run db:init
```

✅ **That's it!** Visit **http://localhost:3000**

**What this does:**
- ✅ Starts PostgreSQL in Docker
- ✅ Builds and starts Next.js app in Docker
- ✅ Sets up networking between containers
- ✅ Everything runs in background
- ✅ Auto-restarts if containers crash
- ✅ Production-like environment

---

### Option 2: Hybrid (PostgreSQL in Docker, Next.js Local)

```bash
# Start PostgreSQL only, run Next.js locally for faster reload
make dev-postgres && npm run dev
```

✅ Visit **http://localhost:3000**

**Best for:**
- 🔥 Fast hot reload during development
- 🐛 Easy debugging with local Node.js
- 💻 Lower resource usage

---

## 📋 Detailed Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Start PostgreSQL (One Command)

```bash
make dev-postgres
```

This automatically:
- ✅ Starts PostgreSQL in Docker
- ✅ Creates database and user
- ✅ Sets up proper networking
- ✅ Enables health checks

**Alternative if you don't have Make:**
```bash
docker-compose -f docker-compose.dev.yml up postgres -d
```

### 3. Configure Environment (One Time Only)

```bash
# Copy template
cp .env.docker.example .env.local

# Edit .env.local with your Spotify credentials:
# - SPOTIFY_CLIENT_ID (from Spotify Developer Dashboard)
# - SPOTIFY_CLIENT_SECRET (from Spotify Developer Dashboard)
# - NEXTAUTH_SECRET (generate: openssl rand -base64 32)
# - DATABASE_URL is already set!
# - EDMTRAIN_API_KEY (add when you receive it)
```

### 4. Initialize Database (One Time Only)

```bash
npm run db:init
```

### 5. Start Development Server

```bash
npm run dev
```

Visit **http://localhost:3000** and sign in with Spotify!

---

## ⚡ TL;DR - Copy & Paste This

### Full Docker Approach (Recommended for simplicity)

```bash
# First time setup:
cp .env.docker.example .env.local
# Edit .env.local with your Spotify credentials

# Start everything:
make prod           # OR: docker-compose up -d --build
make db-init        # OR: docker exec metricify-app npm run db:init

# View logs:
make logs

# That's it! App running at http://localhost:3000
```

### Hybrid Approach (Recommended for development speed)

```bash
# First time setup:
npm install
make dev-postgres
npm run db:init

# Daily development:
npm run dev
```

---

## 🔄 Daily Development Workflow

### Full Docker Workflow

```bash
# Day 1 (first time):
make prod            # Start everything
make db-init         # Initialize database

# Day 2+ (already running):
# Nothing! Containers auto-restart

# To view logs:
make logs

# To stop everything:
make down

# To restart after changes:
make rebuild
```

### Hybrid Workflow

```bash
# Day 1 (first time):
make dev-postgres    # Start PostgreSQL
npm run db:init      # Initialize database
npm run dev          # Start app

# Day 2+ (PostgreSQL already running):
npm run dev          # Just this!

# To stop PostgreSQL:
make down
```

---

## 🎪 When You Get EDMTrain API Key

```bash
# 1. Add key to .env.local
echo "EDMTRAIN_API_KEY=your_actual_key" >> .env.local

# 2. Sync festival data
npm run festivals:sync

# 3. View your personalized recommendations!
```

---

## 🐛 Troubleshooting

**"Port 3000 or 5432 already in use"**
```bash
# Check what's running
docker ps
lsof -i :3000
lsof -i :5432

# Stop local services
brew services stop postgresql  # If you have local PostgreSQL
make down                      # Stop Docker containers
```

**"Can't connect to database" (Full Docker)**
```bash
# Check if containers are healthy
docker ps

# View logs
make logs

# Restart everything
make down
make prod
```

**"Can't connect to database" (Hybrid)**
```bash
# Restart PostgreSQL
make down
make dev-postgres
```

**Spotify redirect error?**
- Add **exactly** this to Spotify app settings: `http://localhost:3000/api/auth/callback/spotify`

**Container keeps restarting?**
```bash
# Check logs for error
docker logs metricify-app --tail 50

# Common fix: verify .env.local has all required vars
# Rebuild if needed
make rebuild
```

**Want to use pgAdmin (database UI)?**
```bash
make dev  # Starts PostgreSQL + pgAdmin at localhost:5050
```

---

## 📖 More Documentation

- [START_HERE.md](START_HERE.md) - Complete getting started guide
- [DOCKER_QUICK_REF.md](DOCKER_QUICK_REF.md) - All Docker commands
- [DOCKER_SETUP.md](DOCKER_SETUP.md) - Detailed Docker guide
- [TECHNICAL_ROADMAP.md](TECHNICAL_ROADMAP.md) - What's planned

---

## 🎯 Quick Commands Reference

### Docker Commands

```bash
# Full Docker
make prod            # Start everything (PostgreSQL + Next.js app)
make down            # Stop all services
make logs            # View logs (Ctrl+C to exit)
make rebuild         # Rebuild and restart
make status          # Show what's running

# Hybrid Development
make dev-postgres    # Start PostgreSQL only
make dev             # Start PostgreSQL + pgAdmin

# Database
make db-init         # Initialize database (full Docker)
npm run db:init      # Initialize database (hybrid)
make db-shell        # Open PostgreSQL CLI
make db-backup       # Backup database

# Utilities
docker ps            # See all running containers
docker logs metricify-app -f     # Follow app logs
docker logs metricify-postgres -f # Follow PostgreSQL logs
```

### When Using Full Docker

```bash
# Access app container shell
docker exec -it metricify-app sh

# Run npm commands inside container
docker exec metricify-app npm run festivals:sync
docker exec metricify-app npm run interests:calculate
```

---

**Version:** 1.0.1 • **Branch:** v1.0.1

**Built with 💚 for festival lovers** 🎪
