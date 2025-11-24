# Docker Quick Reference Card

**One-page guide for common Docker operations**

---

## 🚀 Getting Started

### Development Setup (Recommended)

```bash
# Start PostgreSQL only
make dev-postgres
# OR
docker-compose -f docker-compose.dev.yml up postgres -d

# Configure environment
cp .env.docker.example .env.local
# Edit .env.local with your credentials

# Initialize database
npm run db:init

# Run Next.js locally
npm run dev
```

**Access:** http://localhost:3000

---

### Full Docker Stack

```bash
# Production
make prod
# OR
docker-compose up -d --build

# Development (with pgAdmin)
make dev
# OR
docker-compose -f docker-compose.dev.yml up -d
```

---

## 📋 Common Commands

| Command | Description |
|---------|-------------|
| `make dev` | Start dev environment (PostgreSQL + pgAdmin) |
| `make dev-postgres` | Start PostgreSQL only |
| `make prod` | Start production environment |
| `make down` | Stop all services |
| `make logs` | View all logs |
| `make logs SERVICE=postgres` | View specific service logs |
| `make db-init` | Initialize database schema |
| `make db-shell` | Open PostgreSQL shell |
| `make db-backup` | Backup database |
| `make shell` | Access app container |
| `make clean` | Stop and remove volumes ⚠️ |
| `make status` | Show container status |

---

## 🗄️ Database Operations

```bash
# Initialize schema
npm run db:init

# Access PostgreSQL
docker exec -it metricify-postgres psql -U metricify_user -d metricify

# Backup
make db-backup

# Restore
make db-restore BACKUP=backups/metricify_20250123.sql

# View tables
docker exec metricify-postgres psql -U metricify_user -d metricify -c "\dt"
```

---

## 🎪 Festival Data

```bash
# Sync festivals from EDMTrain
make festival-sync
# OR
npm run festivals:sync

# Calculate interests
make interest-calc
# OR
npm run interests:calculate

# Clear cache
make cache-clear
```

---

## 🔍 Debugging

```bash
# View logs
docker-compose logs -f metricify
docker-compose logs -f postgres

# Access container shell
docker exec -it metricify-app sh
docker exec -it metricify-postgres sh

# Check health
docker ps
docker inspect metricify-postgres

# Test PostgreSQL connection
docker exec metricify-postgres pg_isready -U metricify_user
```

---

## 🌐 Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| **Metricify App** | http://localhost:3000 | Spotify OAuth |
| **PostgreSQL** | localhost:5432 | metricify_user / (see .env.local) |
| **pgAdmin** (dev) | http://localhost:5050 | admin@metricify.com / admin |

---

## 📦 Environment Files

```bash
# Development
.env.local
DATABASE_URL=postgresql://metricify_user:dev_password_123@localhost:5432/metricify

# Production
.env.local
DATABASE_URL=postgresql://metricify_user:secure_password@postgres:5432/metricify
```

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 5432 in use | `lsof -i :5432` then kill process or change port |
| Can't connect to DB | `docker-compose restart postgres` |
| Container won't start | `docker-compose down -v && docker-compose up -d --build` |
| Database schema missing | `npm run db:init` |

---

## 🔄 Development Workflow

### Local Development
```bash
1. Start PostgreSQL: make dev-postgres
2. Update .env.local
3. Initialize DB: npm run db:init
4. Run app: npm run dev
```

### Docker Development
```bash
1. Build: docker-compose up -d --build
2. View logs: make logs
3. Make changes
4. Rebuild: make rebuild
```

---

## 📊 Database Schema

**Tables:**
- `festivals` - Festival information
- `festival_lineups` - Artist lineups
- `artist_mappings` - Spotify ↔ EDMTrain
- `user_festival_interests` - Interest scores
- `user_itineraries` - User schedules
- `api_cache` - Response caching

---

## 🔐 Security Checklist

- [ ] Change `POSTGRES_PASSWORD` in .env.local
- [ ] Generate new `NEXTAUTH_SECRET`
- [ ] Add Spotify credentials
- [ ] Add EDMTrain API key
- [ ] Update `NEXTAUTH_URL` for production

---

**Quick Links:**
- [Full Setup Guide](SETUP_GUIDE.md)
- [Docker Setup](DOCKER_SETUP.md)
- [Technical Roadmap](TECHNICAL_ROADMAP.md)
