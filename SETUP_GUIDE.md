# Metricify v1.0.1 - Setup Guide

This guide will walk you through setting up the Metricify festival planner application.

---

## Prerequisites

- **Node.js** 20+ LTS
- **PostgreSQL** 15+ installed and running
- **Spotify Developer Account** (for API credentials)
- **EDMTrain API Key** (apply at https://edmtrain.com/api-documentation)

---

## Step 1: PostgreSQL Database Setup

### Option A: Local PostgreSQL Installation

1. **Install PostgreSQL** (if not already installed):

```bash
# macOS (using Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Download installer from https://www.postgresql.org/download/windows/
```

2. **Create Database and User**:

```bash
# Access PostgreSQL
psql postgres

# Create user and database
CREATE USER metricify_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE metricify OWNER metricify_user;
GRANT ALL PRIVILEGES ON DATABASE metricify TO metricify_user;

# Connect to the metricify database
\c metricify

# Enable uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

# Exit
\q
```

### Option B: Docker PostgreSQL (Recommended for Development)

```bash
# Run PostgreSQL in Docker
docker run --name metricify-postgres \
  -e POSTGRES_USER=metricify_user \
  -e POSTGRES_PASSWORD=your_secure_password \
  -e POSTGRES_DB=metricify \
  -p 5432:5432 \
  -d postgres:15

# Verify it's running
docker ps
```

---

## Step 2: Install Dependencies

```bash
cd /Users/roger/Desktop/Projects/Metricify
npm install
```

---

## Step 3: Environment Configuration

1. **Copy example environment file**:

```bash
cp .env.example .env.local
```

2. **Edit `.env.local`** with your credentials:

```bash
# Spotify OAuth Configuration
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret  # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000

# PostgreSQL Database
DATABASE_URL=postgresql://metricify_user:your_secure_password@localhost:5432/metricify

# EDMTrain API
EDMTRAIN_API_KEY=your_edmtrain_api_key

# Environment
NODE_ENV=development
```

### Getting API Credentials

**Spotify API:**
1. Go to https://developer.spotify.com/dashboard
2. Create a new app
3. Add redirect URI: `http://localhost:3000/api/auth/callback/spotify`
4. Copy Client ID and Client Secret

**EDMTrain API:**
1. Visit https://edmtrain.com/api-documentation
2. Apply for a developer API key
3. Wait for approval (usually 24-48 hours)
4. Copy the API key once approved

---

## Step 4: Initialize Database Schema

```bash
npm run db:init
```

This will create all necessary tables and indexes in your PostgreSQL database.

**Tables created:**
- `listening_history` - User listening data
- `artist_plays` - Artist play counts
- `genre_trends` - Genre tracking
- `user_statistics` - User stats snapshots
- `festivals` - Festival information
- `festival_lineups` - Festival artist lineups
- `artist_mappings` - Spotify ↔ EDMTrain artist mappings
- `user_festival_interests` - User festival interest scores
- `user_itineraries` - User festival itineraries
- `api_cache` - API response caching

---

## Step 5: Run Development Server

```bash
npm run dev
```

The application will be available at **http://localhost:3000**

---

## Step 6: First-Time Setup

1. **Navigate to http://localhost:3000**
2. **Click "Connect with Spotify"**
3. **Authorize the application**
4. **You'll be redirected to the dashboard**

---

## Step 7: Sync Festival Data (Initial Load)

After authentication, you need to populate the festival database:

```bash
# In a separate terminal, run the sync script (when created)
npm run festivals:sync
```

This will:
1. Fetch upcoming US festivals for the next 3 months from EDMTrain
2. Store them in the PostgreSQL database
3. Build artist mappings between Spotify and EDMTrain
4. Calculate your festival interests

---

## Troubleshooting

### PostgreSQL Connection Error

**Error:** `ECONNREFUSED ::1:5432`

**Solution:**
1. Verify PostgreSQL is running:
   ```bash
   # macOS
   brew services list

   # Linux
   sudo systemctl status postgresql

   # Docker
   docker ps
   ```

2. Check DATABASE_URL in `.env.local`
3. Test connection:
   ```bash
   psql postgresql://metricify_user:password@localhost:5432/metricify
   ```

### EDMTrain API Key Not Working

**Error:** `EDMTRAIN_API_KEY environment variable is not set`

**Solution:**
1. Ensure `.env.local` has `EDMTRAIN_API_KEY=your_key`
2. Restart the dev server after changing environment variables
3. Verify API key is active at EDMTrain developer portal

### Spotify OAuth Redirect Error

**Error:** `redirect_uri_mismatch`

**Solution:**
1. Go to Spotify Developer Dashboard
2. Edit your app settings
3. Add exact redirect URI: `http://localhost:3000/api/auth/callback/spotify`
4. Save and try again

### Database Schema Not Created

**Error:** `relation "festivals" does not exist`

**Solution:**
```bash
# Run the initialization script
npm run db:init

# Or manually with psql
psql -U metricify_user -d metricify -f scripts/init-db.sql
```

---

## Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Initialize database schema
npm run db:init

# Sync festival data from EDMTrain
npm run festivals:sync

# Calculate user interests (after festival sync)
npm run interests:calculate

# Clear API cache
npm run cache:clear
```

---

## Production Deployment

### AWS RDS PostgreSQL Setup

1. **Create RDS PostgreSQL instance** (recommended: db.t3.micro for development)
2. **Update DATABASE_URL** in production environment:
   ```
   DATABASE_URL=postgresql://username:password@your-rds-endpoint.amazonaws.com:5432/metricify
   ```
3. **Run migrations** on production database
4. **Set up automated backups** in RDS console

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform (Vercel, AWS, etc.):

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your production URL)
- `DATABASE_URL` (production PostgreSQL connection string)
- `EDMTRAIN_API_KEY`
- `NODE_ENV=production`

---

## Next Steps

1. ✅ Complete local setup
2. ✅ Authenticate with Spotify
3. ✅ Sync festival data
4. 📅 Calculate your festival interests
5. 🎉 Start planning your festival schedule!

---

## Support

For issues or questions:
- Check the [TECHNICAL_ROADMAP.md](./TECHNICAL_ROADMAP.md)
- Review [EDMTRAIN_API_REFERENCE.md](./EDMTRAIN_API_REFERENCE.md)
- Open an issue on GitHub

---

**Version:** 1.0.1
**Last Updated:** 2025-11-23
