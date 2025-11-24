# Metricify v1.0.1 - Quick Start Guide

**5-Minute Setup for Development**

---

## Prerequisites

- Node.js 20+
- PostgreSQL 15+ OR Docker
- Spotify Developer Account
- EDMTrain API Key (apply at https://edmtrain.com/api-documentation)

---

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up PostgreSQL

**Option A - Docker (Easiest):**
```bash
docker run --name metricify-postgres \
  -e POSTGRES_USER=metricify_user \
  -e POSTGRES_PASSWORD=password123 \
  -e POSTGRES_DB=metricify \
  -p 5432:5432 \
  -d postgres:15
```

**Option B - Local Installation:**
```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Create database
psql postgres -c "CREATE USER metricify_user WITH PASSWORD 'password123';"
psql postgres -c "CREATE DATABASE metricify OWNER metricify_user;"
```

### 3. Configure Environment

```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local with your credentials:
# - SPOTIFY_CLIENT_ID
# - SPOTIFY_CLIENT_SECRET
# - NEXTAUTH_SECRET (generate: openssl rand -base64 32)
# - DATABASE_URL
# - EDMTRAIN_API_KEY
```

### 4. Initialize Database

```bash
npm run db:init
```

### 5. Start Development Server

```bash
npm run dev
```

Visit **http://localhost:3000** and sign in with Spotify!

---

## Next Steps

1. Apply for EDMTrain API key at https://edmtrain.com/api-documentation
2. Run `npm run festivals:sync` to load festival data (once API key approved)
3. View personalized festival recommendations in dashboard

---

## Troubleshooting

**Database connection error?**
```bash
# Verify PostgreSQL is running
docker ps  # For Docker
brew services list  # For Homebrew

# Test connection
psql postgresql://metricify_user:password123@localhost:5432/metricify
```

**Spotify redirect error?**
- Add `http://localhost:3000/api/auth/callback/spotify` to Spotify app settings

**Missing EDMTrain API key?**
- Festival features won't work until API key is obtained and added to `.env.local`

---

## Key Documentation

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Detailed setup instructions
- [PHASE1_IMPLEMENTATION_SUMMARY.md](PHASE1_IMPLEMENTATION_SUMMARY.md) - What's been built
- [TECHNICAL_ROADMAP.md](TECHNICAL_ROADMAP.md) - Full technical plan
- [EDMTRAIN_API_REFERENCE.md](EDMTRAIN_API_REFERENCE.md) - API documentation

---

**Version:** 1.0.1 • **Branch:** v1.0.1
