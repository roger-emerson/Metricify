# Metricify Docker Setup Guide

Complete guide for running Metricify with Docker and PostgreSQL.

---

## Quick Start (Development)

### 1. Start PostgreSQL Only

```bash
# Start just PostgreSQL for local development
docker-compose -f docker-compose.dev.yml up postgres -d

# Your Next.js app will connect to: localhost:5432
```

Then run the Next.js app locally:
```bash
npm run dev
```

---

### 2. Full Docker Stack (Development)

```bash
# Start PostgreSQL + pgAdmin
docker-compose -f docker-compose.dev.yml up -d

# Access:
# - PostgreSQL: localhost:5432
# - pgAdmin: http://localhost:5050 (admin@metricify.com / admin)
```

---

## Production Setup

### 1. Environment Configuration

```bash
# Copy example environment file
cp .env.docker.example .env.local

# Edit .env.local with your credentials
nano .env.local
```

**Required variables:**
- `SPOTIFY_CLIENT_ID` - From Spotify Developer Dashboard
- `SPOTIFY_CLIENT_SECRET` - From Spotify Developer Dashboard
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `EDMTRAIN_API_KEY` - From EDMTrain API application
- `POSTGRES_PASSWORD` - Secure password for PostgreSQL

---

### 2. Build and Run

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

**Services:**
- Metricify App: http://localhost:3000
- PostgreSQL: localhost:5432

---

### 3. Initialize Database

The database schema is automatically initialized when containers start. To manually initialize:

```bash
# Access the app container
docker exec -it metricify-app sh

# Run initialization
npm run db:init

# Exit
exit
```

---

## Docker Commands Reference

### Container Management

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f metricify
docker-compose logs -f postgres

# Access shell in app container
docker exec -it metricify-app sh

# Access PostgreSQL shell
docker exec -it metricify-postgres psql -U metricify_user -d metricify
```

---

### Database Management

```bash
# Backup database
docker exec metricify-postgres pg_dump -U metricify_user metricify > backup.sql

# Restore database
cat backup.sql | docker exec -i metricify-postgres psql -U metricify_user -d metricify

# View database size
docker exec metricify-postgres psql -U metricify_user -d metricify -c "\l+"

# List tables
docker exec metricify-postgres psql -U metricify_user -d metricify -c "\dt"
```

---

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect metricify_postgres_data

# Remove volumes (⚠️ DELETES DATA)
docker-compose down -v
```

---

## Development Workflow

### Option 1: Hybrid (Recommended)

PostgreSQL in Docker, Next.js locally:

```bash
# Start PostgreSQL
docker-compose -f docker-compose.dev.yml up postgres -d

# Update .env.local
DATABASE_URL=postgresql://metricify_user:dev_password_123@localhost:5432/metricify

# Run app locally
npm run dev

# Initialize database (first time only)
npm run db:init
```

**Benefits:**
- Fast hot-reload
- Easy debugging
- PostgreSQL managed by Docker

---

### Option 2: Full Docker

Everything in containers:

```bash
# Start all services
docker-compose up -d --build

# Watch logs
docker-compose logs -f metricify

# Make changes and rebuild
docker-compose up -d --build metricify
```

**Benefits:**
- Production-like environment
- Isolated from local machine
- Easy to share with team

---

## pgAdmin Usage (Development)

Access pgAdmin at http://localhost:5050

**Credentials:**
- Email: admin@metricify.com
- Password: admin

**Add PostgreSQL Server:**
1. Right-click "Servers" → "Register" → "Server"
2. General Tab:
   - Name: Metricify
3. Connection Tab:
   - Host: postgres (container name)
   - Port: 5432
   - Username: metricify_user
   - Password: dev_password_123 (or your password)

---

## Troubleshooting

### PostgreSQL Connection Issues

**Error:** `ECONNREFUSED`

```bash
# Check if PostgreSQL is running
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check health
docker exec metricify-postgres pg_isready -U metricify_user
```

---

### Database Initialization Failed

```bash
# Access container
docker exec -it metricify-app sh

# Check database connection
npm run db:init

# View detailed error
docker-compose logs metricify
```

---

### Port Already in Use

**Error:** `port 5432 is already allocated`

```bash
# Check what's using the port
lsof -i :5432

# Option 1: Stop local PostgreSQL
brew services stop postgresql

# Option 2: Change port in docker-compose.yml
# Change "5432:5432" to "5433:5432"
# Update DATABASE_URL to use port 5433
```

---

### Container Won't Start

```bash
# Remove containers and volumes
docker-compose down -v

# Rebuild from scratch
docker-compose up -d --build --force-recreate

# Check for errors
docker-compose logs
```

---

## Environment-Specific Configurations

### Development

```bash
# docker-compose.dev.yml features:
# - PostgreSQL on port 5432
# - pgAdmin on port 5050
# - Volume: postgres_dev_data
# - Network: metricify-dev-network
```

### Production

```bash
# docker-compose.yml features:
# - PostgreSQL with healthcheck
# - Next.js app with auto-restart
# - Persistent volumes
# - Production-optimized build
```

---

## Performance Optimization

### PostgreSQL Tuning

Edit `docker-compose.yml` to add performance settings:

```yaml
postgres:
  environment:
    # ... existing vars
  command:
    - "postgres"
    - "-c"
    - "shared_buffers=256MB"
    - "-c"
    - "max_connections=100"
    - "-c"
    - "work_mem=4MB"
```

---

### Next.js Build Cache

```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker-compose build

# Multi-stage build is already optimized in Dockerfile
```

---

## Monitoring

### Resource Usage

```bash
# View container stats
docker stats

# View disk usage
docker system df

# Detailed volume info
docker volume inspect metricify_postgres_data
```

---

### Health Checks

```bash
# Check PostgreSQL health
docker exec metricify-postgres pg_isready -U metricify_user -d metricify

# Check app health
curl http://localhost:3000/api/festivals

# View container health status
docker inspect --format='{{.State.Health.Status}}' metricify-postgres
```

---

## Data Persistence

### Backup Strategy

```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker exec metricify-postgres pg_dump -U metricify_user metricify > $BACKUP_DIR/metricify_$TIMESTAMP.sql
echo "Backup created: metricify_$TIMESTAMP.sql"
```

---

### Migration Between Environments

```bash
# Export from dev
docker exec metricify-postgres-dev pg_dump -U metricify_user metricify > dev_export.sql

# Import to production
cat dev_export.sql | docker exec -i metricify-postgres psql -U metricify_user -d metricify
```

---

## Security Best Practices

1. **Change default passwords** in `.env.local`
2. **Use secrets management** for production (AWS Secrets Manager, etc.)
3. **Restrict network access** in docker-compose.yml
4. **Regular backups** of PostgreSQL volume
5. **Update images regularly**: `docker-compose pull`

---

## Production Deployment (AWS Example)

### Using Docker Compose on EC2

```bash
# Install Docker & Docker Compose on EC2
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone repo and deploy
git clone <your-repo>
cd Metricify
cp .env.docker.example .env.local
# Edit .env.local with production values
docker-compose up -d --build
```

---

### Using AWS ECS/Fargate

See AWS deployment documentation for ECS task definitions and RDS integration.

---

## Next Steps

1. ✅ Start PostgreSQL: `docker-compose -f docker-compose.dev.yml up postgres -d`
2. ✅ Configure `.env.local` with your credentials
3. ✅ Initialize database: `npm run db:init`
4. ✅ Start development: `npm run dev`
5. 🎪 Sync festivals: `npm run festivals:sync` (after EDMTrain API key)

---

**Version:** 1.0.1
**Last Updated:** 2025-11-23
