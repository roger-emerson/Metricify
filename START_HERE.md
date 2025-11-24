# 🚀 START HERE - Metricify v1.0.1

**Your Complete Guide to Getting Metricify Running**

---

## ✅ Current Status

You're on branch **v1.0.1** with Phase 1 complete!

**What's been built:**
- ✅ PostgreSQL database infrastructure
- ✅ EDMTrain API client
- ✅ Artist matching engine
- ✅ Interest calculation service
- ✅ Festival API endpoints
- ✅ Complete Docker setup

**What you need to do:**
- 🔲 Get EDMTrain API key (you've applied!)
- 🔲 Set up local environment
- 🔲 Start development

---

## 🎯 Choose Your Setup Path

### Path A: Hybrid Setup (Recommended for Development)

**Best for:** Fast development with hot reload

```bash
# 1. Start PostgreSQL in Docker
make dev-postgres
# OR
docker-compose -f docker-compose.dev.yml up postgres -d

# 2. Copy environment file
cp .env.docker.example .env.local

# 3. Edit .env.local with your credentials
# - SPOTIFY_CLIENT_ID (from Spotify Developer Dashboard)
# - SPOTIFY_CLIENT_SECRET (from Spotify Developer Dashboard)
# - NEXTAUTH_SECRET (generate: openssl rand -base64 32)
# - EDMTRAIN_API_KEY (when you receive it)
# - DATABASE_URL already set for localhost

# 4. Initialize database
npm run db:init

# 5. Run Next.js locally
npm run dev
```

✅ **Result:** App at http://localhost:3000, PostgreSQL in Docker

---

### Path B: Full Docker Setup

**Best for:** Production-like environment

```bash
# 1. Copy environment file
cp .env.docker.example .env.local

# 2. Edit .env.local with your credentials
# Same as Path A, but DATABASE_URL uses 'postgres' hostname

# 3. Build and start everything
make prod
# OR
docker-compose up -d --build

# 4. Initialize database (inside container)
make db-init
# OR
docker exec metricify-app npm run db:init

# 5. View logs
make logs
```

✅ **Result:** Everything containerized at http://localhost:3000

---

## 📋 Pre-Setup Checklist

### 1. Install Docker

**macOS:**
```bash
# Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop
```

**Already have Docker?**
```bash
# Verify installation
docker --version
docker-compose --version
```

---

### 2. Get Spotify Credentials

1. Go to https://developer.spotify.com/dashboard
2. Click "Create App"
3. Fill in details:
   - **App Name:** Metricify Local Dev
   - **App Description:** Festival planner
   - **Redirect URI:** `http://localhost:3000/api/auth/callback/spotify`
4. Click "Save"
5. Copy **Client ID** and **Client Secret**

---

### 3. Wait for EDMTrain API Key

You've already applied! Check your email for approval.

When you receive it, add to `.env.local`:
```bash
EDMTRAIN_API_KEY=your_actual_api_key_here
```

---

### 4. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy the output to `.env.local`:
```bash
NEXTAUTH_SECRET=<paste_here>
```

---

## 🔧 Your .env.local Should Look Like This

```bash
# Spotify OAuth
SPOTIFY_CLIENT_ID=abc123def456
SPOTIFY_CLIENT_SECRET=xyz789uvw012

# NextAuth
NEXTAUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=http://localhost:3000

# PostgreSQL (for Path A - local development)
DATABASE_URL=postgresql://metricify_user:dev_password_123@localhost:5432/metricify

# PostgreSQL (for Path B - full Docker)
# DATABASE_URL=postgresql://metricify_user:metricify_secure_password_2024@postgres:5432/metricify

# EDMTrain API (add when you receive it)
EDMTRAIN_API_KEY=your_edmtrain_key_here

# Environment
NODE_ENV=development
```

---

## 🚦 Step-by-Step: First Run

### Using Path A (Hybrid - Recommended)

```bash
# Step 1: Start PostgreSQL
make dev-postgres

# Verify it's running
docker ps
# You should see: metricify-postgres-dev

# Step 2: Install dependencies (if not done)
npm install

# Step 3: Initialize database
npm run db:init

# You should see:
# ✅ Database initialization complete!
# 📋 Tables created: festivals, festival_lineups, etc.

# Step 4: Start Next.js
npm run dev

# You should see:
# ✓ Ready in X.XXs
# ○ Local:   http://localhost:3000
```

---

### Using Path B (Full Docker)

```bash
# Step 1: Build and start
make prod

# OR manually:
docker-compose up -d --build

# Step 2: Initialize database
make db-init

# Step 3: View logs to verify
make logs

# You should see both containers running
docker ps
# - metricify-app
# - metricify-postgres
```

---

## 🧪 Test Your Setup

### 1. Open App
Visit http://localhost:3000

You should see the Metricify landing page.

---

### 2. Test Spotify Login
Click "Connect with Spotify"

You'll be redirected to Spotify to authorize.

After authorization, you should see the dashboard.

---

### 3. Check Database
```bash
# Access PostgreSQL
docker exec -it metricify-postgres psql -U metricify_user -d metricify

# List tables
\dt

# You should see:
# - festivals
# - festival_lineups
# - artist_mappings
# - user_festival_interests
# ... and more

# Exit
\q
```

---

### 4. Test API Endpoints

**Without EDMTrain key:**
```bash
# These will work (Spotify data)
curl http://localhost:3000/api/spotify/analytics
```

**With EDMTrain key:**
```bash
# These will work (Festival data)
curl http://localhost:3000/api/festivals
```

---

## 🎪 What to Do Next

### When You Get EDMTrain API Key

```bash
# 1. Add to .env.local
EDMTRAIN_API_KEY=your_actual_key

# 2. Restart your app
# Path A: Ctrl+C and `npm run dev`
# Path B: `docker-compose restart`

# 3. Sync festival data (this will take a few minutes)
npm run festivals:sync
# OR
make festival-sync

# You should see:
# ✅ Synced X festivals
# ✅ Synced X artists

# 4. Calculate your interests (after logging in with Spotify)
npm run interests:calculate
# OR
make interest-calc

# You should see:
# ✅ Calculated interests for X festivals
```

---

## 📚 Quick Command Reference

```bash
# Development
make dev-postgres     # Start PostgreSQL only
npm run dev           # Run Next.js locally
npm run db:init       # Initialize database

# Docker
make dev              # Full dev environment + pgAdmin
make prod             # Production environment
make down             # Stop services
make logs             # View logs
make status           # Show container status

# Database
make db-shell         # Open PostgreSQL shell
make db-backup        # Backup database
npm run db:init       # Initialize schema

# Festival Data
npm run festivals:sync          # Sync from EDMTrain
npm run interests:calculate     # Calculate user interests
npm run cache:clear             # Clear API cache
```

---

## 🐛 Common Issues

### "Port 5432 already in use"

**Solution:** Stop local PostgreSQL or change port
```bash
# macOS
brew services stop postgresql

# OR change port in docker-compose.dev.yml
# "5433:5432" instead of "5432:5432"
# Then update DATABASE_URL to use port 5433
```

---

### "EDMTRAIN_API_KEY environment variable is not set"

**Solution:** This is normal! Festival features won't work until you add the API key.

For now, you can still:
- ✅ Use Spotify features
- ✅ View dashboard analytics
- ✅ See your top artists/tracks
- ❌ Can't view festivals yet

---

### "Database connection refused"

**Solution:** Check PostgreSQL is running
```bash
# Check container status
docker ps

# Should show metricify-postgres or metricify-postgres-dev

# If not running:
make dev-postgres
```

---

### "Spotify redirect error"

**Solution:** Update redirect URI in Spotify Developer Dashboard

Must be exactly: `http://localhost:3000/api/auth/callback/spotify`

---

## 🎓 Learning Resources

| Document | Purpose |
|----------|---------|
| [DOCKER_QUICK_REF.md](DOCKER_QUICK_REF.md) | One-page command reference |
| [DOCKER_SETUP.md](DOCKER_SETUP.md) | Complete Docker guide |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Detailed setup instructions |
| [PHASE1_IMPLEMENTATION_SUMMARY.md](PHASE1_IMPLEMENTATION_SUMMARY.md) | What's been built |
| [TECHNICAL_ROADMAP.md](TECHNICAL_ROADMAP.md) | Future plans (Phase 2) |

---

## ✅ Success Checklist

Before moving to Phase 2, verify:

- [ ] Docker installed and running
- [ ] PostgreSQL container running
- [ ] `.env.local` configured with all credentials
- [ ] Database initialized (`npm run db:init`)
- [ ] App accessible at http://localhost:3000
- [ ] Spotify login working
- [ ] Dashboard displays your data
- [ ] EDMTrain API key added (when received)
- [ ] Festival sync completed (when API key ready)

---

## 🆘 Need Help?

1. Check [DOCKER_SETUP.md](DOCKER_SETUP.md) troubleshooting section
2. View logs: `make logs` or `docker-compose logs -f`
3. Verify environment: Check `.env.local` has all required vars
4. Test database: `make db-shell` or `docker exec -it metricify-postgres psql -U metricify_user -d metricify`

---

## 🎉 You're Ready!

Once your setup is complete and EDMTrain API key is received, you'll have:

1. **Working Spotify Integration** - View your listening analytics
2. **Festival Database** - US festivals for next 3 months
3. **Smart Recommendations** - Personalized interest scores
4. **API Backend** - Ready for Phase 2 UI

**Next:** Build the festival recommendation UI (Phase 2)

---

**Happy Festival Planning! 🎪**
