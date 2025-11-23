# Metricify 🎵

**The Most Comprehensive Spotify Analytics Dashboard**

A production-ready, visually stunning analytics platform that provides **extreme granularity** into your Spotify listening habits with beautiful visualizations, historical tracking, and detailed audio analysis.

## ✨ Features

### 🎯 Multi-Tab Dashboard
Navigate through 7 comprehensive analytics tabs:

- **📊 Overview** - Key metrics, musical profile, genre distribution, and tempo analysis
- **🎵 Audio Features** - Deep dive into 12+ acoustic characteristics per track
- **🎸 Genre Analysis** - Visual breakdown of your 20+ top genres
- **🎤 Top Artists** - 50+ artists across 3 time periods (4 weeks, 6 months, all time)
- **🎧 Top Tracks** - 50+ tracks with full metadata and audio features
- **📅 Listening History** - Historical patterns and recently played analysis
- **💿 Library** - Saved tracks, albums, and playlists with beautiful cards

### 🔥 Extreme Granularity Analytics

**Audio Features (12+ Metrics Per Track):**
- Danceability, Energy, Valence (mood)
- Acousticness, Instrumentalness, Speechiness
- Liveness, Loudness, Tempo (BPM)
- Key, Mode (major/minor), Time Signature

**Musical Analysis:**
- Genre distribution and evolution
- Key and mode preferences
- Tempo range categorization
- Energy/valence patterns
- Listening time heatmaps by hour/day

**Historical Tracking:**
- SQLite database for persistent storage
- Listening pattern analysis
- Play count aggregations
- Audio feature trends over time
- Artist/track growth tracking

### 🎨 Beautiful Design

- **Dark Theme** - Spotify-inspired professional interface
- **Interactive Elements** - Hover effects, tooltips, and smooth animations
- **Responsive Layout** - Perfect on desktop, tablet, and mobile
- **Color-Coded Metrics** - Visual hierarchy and easy scanning
- **Glass-morphism Cards** - Modern, clean aesthetic
- **Progress Bars & Charts** - Animated visualizations

### 🚀 Production Features

- **Docker Support** - One-command deployment
- **TypeScript** - Full type safety
- **Next.js 15** - Latest framework features
- **Authentication** - Secure Spotify OAuth
- **Database** - SQLite for historical analytics
- **API Optimization** - Parallel data fetching
- **Lazy Loading** - Performance-optimized tabs

## 📊 Analytics Endpoints

### `/api/spotify/analytics` - Comprehensive
Returns **everything** in one call:
- User profile and library stats
- Top artists/tracks (all time ranges, 50+ each)
- Audio features for all tracks
- Genre, key, mode, tempo analysis
- Database-powered historical insights
- Listening patterns by time/day

### `/api/spotify/dashboard` - Basic
Simplified endpoint for quick overview

## 🛠 Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- React 18 with TypeScript
- Chakra UI for components
- Framer Motion for animations

**Backend:**
- Next.js API Routes
- NextAuth.js for authentication
- Spotify Web API (extended client)

**Database:**
- Better-SQLite3 for historical tracking
- Optimized schemas and indexes

**Visualization:**
- Recharts (ready for advanced charts)
- Chart.js (alternative charting)
- Custom React components

**Deployment:**
- Docker & Docker Compose
- Production-optimized builds
- Multi-stage Dockerfile

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose (easiest method)
- **OR** Node.js 18+ and npm
- Spotify Developer Account

### 1. Spotify Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add redirect URI: `http://127.0.0.1:3000/api/auth/callback/spotify`
4. Note your Client ID and Client Secret

### 2. Environment Configuration

Create `.env.local` in the project root:

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
NEXTAUTH_URL=http://127.0.0.1:3000
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 3. Run with Docker (Recommended)

```bash
docker-compose up -d
```

That's it! The app will:
- Install dependencies
- Build the production app
- Start the server at http://127.0.0.1:3000

### Alternative: Run Locally

```bash
npm install
npm run dev
```

## 📁 Project Structure

```
metricify/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/     # Authentication
│   │   │   └── spotify/
│   │   │       ├── analytics/          # Comprehensive analytics
│   │   │       └── dashboard/          # Basic dashboard
│   │   ├── dashboard/
│   │   │   └── page.tsx                # Main dashboard with tabs
│   │   ├── layout.tsx                  # Root layout with navbar
│   │   ├── page.tsx                    # Landing page
│   │   └── providers.tsx               # Chakra UI provider
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── tabs/                   # 7 dashboard tabs
│   │   │   ├── TopArtists.tsx
│   │   │   ├── TopTracks.tsx
│   │   │   ├── GenreDistribution.tsx
│   │   │   └── ListeningStats.tsx
│   │   └── Navbar.tsx
│   ├── lib/
│   │   ├── auth.ts                     # NextAuth config
│   │   ├── spotify.ts                  # Basic Spotify client
│   │   ├── spotify-extended.ts         # Extended API client
│   │   └── db.ts                       # SQLite database
│   └── types/
│       ├── spotify.ts                  # Spotify types
│       ├── spotify-extended.ts         # Extended types
│       └── next-auth.d.ts              # Auth types
├── data/                                # SQLite database (auto-created)
├── docker-compose.yml
├── Dockerfile                           # Multi-stage production build
├── next.config.ts                       # Standalone output
└── package.json                         # Dependencies
```

## 🎯 Usage

1. **Visit** http://127.0.0.1:3000
2. **Click** "Connect with Spotify"
3. **Authorize** the app (one-time)
4. **Explore** your comprehensive analytics!

### Navigation

Use the **top tab bar** to explore:
- Overview stats and musical profile
- Detailed audio feature breakdowns
- Genre analysis with visual rankings
- Top artists and tracks (multiple time ranges)
- Listening history and patterns
- Your complete library

### Interactive Features

- **Hover** over audio features for detailed tooltips
- **Click** tabs to navigate between views
- **Scroll** through your top 50+ artists/tracks
- **View** real-time updated statistics

## 📖 Documentation

- [GRANULAR_METRICS_GUIDE.md](GRANULAR_METRICS_GUIDE.md) - Complete metrics documentation
- [SPOTIFY_SETUP.md](SPOTIFY_SETUP.md) - Detailed Spotify configuration

## 🔧 Available Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm start        # Production server
npm run lint     # ESLint

# Docker commands
docker-compose up -d              # Start in background
docker-compose down               # Stop containers
docker-compose logs -f            # View logs
docker-compose up -d --build      # Rebuild and start
```

## 🎨 Customization

### Color Theme
Edit `src/app/providers.tsx` to customize colors:
```typescript
colors: {
  spotify: {
    green: '#1DB954',  // Change primary color
    black: '#191414',
  },
}
```

### Database Location
Database is stored in `data/metricify.db` (auto-created)

## 🐛 Troubleshooting

### "Failed to fetch analytics data"
- Check Spotify credentials in `.env.local`
- Verify redirect URI is `http://127.0.0.1:3000/api/auth/callback/spotify`
- Ensure you're using `127.0.0.1` not `localhost`

### Port Already in Use
```bash
# Find and kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

### Docker Issues
```bash
# Clean rebuild
docker-compose down
docker-compose up -d --build --no-cache
```

### Database Issues
```bash
# Reset database
rm -rf data/
# Restart app (database will be recreated)
docker-compose restart
```

## 🔒 Privacy & Security

- **All data stays local** - No external analytics or tracking
- **Secure OAuth** - Industry-standard Spotify authentication
- **Database is local** - SQLite file stored on your machine
- **No third-party services** - Direct Spotify API only

## 🚦 API Rate Limits

Spotify allows:
- **Regular tier:** Standard rate limits
- **Extended quota:** Available on request

The app uses parallel requests and caching to optimize API usage.

## 📈 Performance

- **Production build** - Optimized Next.js output
- **Lazy loading** - Tabs load on demand
- **Database caching** - Historical data stored locally
- **Parallel fetching** - Multiple API calls simultaneously
- **Responsive design** - Fast on all devices

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

For personal and educational use. Spotify API usage subject to [Spotify's Terms of Service](https://developer.spotify.com/terms).

## 🙏 Acknowledgments

- **Spotify** - Comprehensive Web API
- **Chakra UI** - Beautiful component library
- **Next.js** - Amazing React framework
- **Better-SQLite3** - Fast, reliable database

---

**Built with ❤️ for music data enthusiasts**

Need help? Check the [Granular Metrics Guide](GRANULAR_METRICS_GUIDE.md) for detailed documentation.
