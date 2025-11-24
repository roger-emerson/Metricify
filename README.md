# 🎪 Metricify - Your Personal Festival Planner

> Transform your Spotify listening history into personalized EDM festival recommendations

**Version:** 1.0.1 | **Branch:** v1.0.1

---

## What is Metricify?

Metricify analyzes your Spotify listening habits and matches you with EDM festivals featuring your favorite artists. Get personalized recommendations, build conflict-free itineraries, and never miss a set from your top artists again.

### Key Features

- **Smart Festival Matching** - Interest scores based on your top artists, tracks, and genres
- **Personalized Recommendations** - High/medium/low interest categorization
- **Artist Discovery** - See where your favorite artists are playing
- **Genre-Based Filtering** - Find festivals matching your music taste
- **Intelligent Scheduling** - Conflict-free itinerary builder (Phase 2)

---

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Spotify Developer Account
- EDMTrain API Key

### 5-Minute Setup

```bash
# 1. Clone and install
git clone <your-repo>
cd Metricify
npm install

# 2. Start PostgreSQL
make dev-postgres

# 3. Configure environment
cp .env.docker.example .env.local
# Edit .env.local with your credentials

# 4. Initialize database
npm run db:init

# 5. Start app
npm run dev
```

Visit **http://localhost:3000** and sign in with Spotify!

---

## Documentation

- 📖 [Quick Start](QUICK_START.md) - 5-minute setup
- 🐳 [Docker Setup](DOCKER_SETUP.md) - Complete Docker guide
- 🚀 [Setup Guide](SETUP_GUIDE.md) - Detailed setup instructions
- 🗺️ [Technical Roadmap](TECHNICAL_ROADMAP.md) - Phase 1 & 2 plans
- 📊 [Implementation Summary](PHASE1_IMPLEMENTATION_SUMMARY.md) - What's been built
- 🎯 [Docker Quick Ref](DOCKER_QUICK_REF.md) - One-page command reference
- 🔌 [EDMTrain API Reference](EDMTRAIN_API_REFERENCE.md) - API documentation

---

## Docker Commands

```bash
make dev           # Start dev environment (PostgreSQL + pgAdmin)
make dev-postgres  # Start PostgreSQL only (for local dev)
make prod          # Start production environment
make down          # Stop all services
make logs          # View logs
make db-init       # Initialize database
make db-backup     # Backup database
make status        # Show container status
```

---

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Chakra UI** - Component library
- **Framer Motion** - Animations

### Backend
- **Node.js 20** - Runtime
- **PostgreSQL 15** - Primary database
- **NextAuth.js** - Authentication (Spotify OAuth)
- **Express** - API routes (via Next.js)

### APIs & Integrations
- **Spotify Web API** - User listening data
- **EDMTrain API** - Festival & event data

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD (planned)

---

## Project Structure

```
Metricify/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/             # API routes
│   │   │   ├── festivals/   # Festival endpoints
│   │   │   └── spotify/     # Spotify endpoints
│   │   ├── dashboard/       # Dashboard page
│   │   └── page.tsx         # Landing page
│   ├── components/          # React components
│   ├── lib/                 # Core libraries
│   │   ├── db-postgres.ts   # Database client
│   │   ├── edmtrain.ts      # EDMTrain API client
│   │   ├── matching.ts      # Artist matching engine
│   │   └── interest-calculator.ts
│   └── types/               # TypeScript types
├── scripts/                 # Utility scripts
├── docker-compose.yml       # Production Docker setup
├── docker-compose.dev.yml   # Development Docker setup
└── Makefile                 # Quick commands
```

---

## Environment Variables

```bash
# Spotify OAuth
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret

# NextAuth
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

# PostgreSQL
DATABASE_URL=postgresql://metricify_user:password@localhost:5432/metricify

# EDMTrain
EDMTRAIN_API_KEY=your_api_key_here
```

---

## Development Workflow

### Local Development (Recommended)

PostgreSQL in Docker, Next.js locally for fast reload:

```bash
# Terminal 1: Start PostgreSQL
make dev-postgres

# Terminal 2: Run Next.js
npm run dev
```

### Full Docker Development

Everything containerized:

```bash
make prod
make logs
```

---

## Database

### Schema

- **festivals** - Festival info (name, location, dates)
- **festival_lineups** - Artist lineups per festival
- **artist_mappings** - Spotify ↔ EDMTrain artist IDs
- **user_festival_interests** - Calculated interest scores
- **user_itineraries** - User-generated schedules

### Commands

```bash
npm run db:init              # Initialize schema
npm run festivals:sync       # Sync festival data
npm run interests:calculate  # Calculate user interests
npm run cache:clear          # Clear API cache
```

---

## API Endpoints

```
GET  /api/festivals              # List all festivals
GET  /api/festivals/[id]         # Festival details
GET  /api/festivals/interests    # User's interests
GET  /api/spotify/analytics      # Spotify analytics
```

---

## Phase 1 Complete ✅

### Implemented Features

- ✅ PostgreSQL database with 10 tables
- ✅ EDMTrain API integration with caching
- ✅ Multi-strategy artist matching (90%+ accuracy)
- ✅ Interest calculation (0-100 point system)
- ✅ Festival API endpoints
- ✅ Docker infrastructure
- ✅ Comprehensive documentation

### Next Steps (Phase 2)

- 🔲 Dashboard UI cleanup
- 🔲 Festival recommendation tab
- 🔲 Itinerary builder
- 🔲 Artist/genre pages
- 🔲 Conflict detection

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is private and proprietary.

---

## Support

For issues or questions:
- Check the [documentation](SETUP_GUIDE.md)
- Review [troubleshooting guide](DOCKER_SETUP.md#troubleshooting)
- Open an issue on GitHub

---

## Acknowledgments

- **Spotify Web API** - User listening data
- **EDMTrain** - Festival and event database
- **Claude Code** - Development assistance

---

**Built with 💚 for festival lovers**

*Never miss a set from your favorite artists again* 🎧
