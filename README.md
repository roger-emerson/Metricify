# Metricify 🎵

A visually stunning dashboard for visualizing your Spotify listening metrics, exploring your favorite artists, and planning your festival experience.

## Features

### Current Features
- 🎨 **Beautiful Dark UI** - Spotify-themed interface with Chakra UI components
- 🔐 **Spotify SSO** - Secure authentication using Spotify OAuth
- 📊 **Listening Metrics** - Detailed insights into your listening habits
- 🎤 **Top Artists** - Discover your most-played artists across different time periods
- 🎵 **Top Songs** - View your favorite tracks with rich metadata
- 📈 **Recent Activity** - Track your recently played songs
- 🎨 **Interactive Visualizations** - Engaging, clickable components for data exploration

### Planned Features
- 🎪 **Festival Integration** - Import festival lineups and match with your listening data
- 📅 **Smart Scheduling** - Get personalized schedule recommendations based on your top artists
- 🗺️ **Festival Planner** - Organize your festival experience with set time reminders
- 🎯 **Artist Suggestions** - Discover new artists at festivals based on your taste
- 📱 **Mobile Optimization** - Responsive design for on-the-go festival planning

## Tech Stack

- **Frontend**: Next.js 15 (React 18) with TypeScript
- **Styling**: Chakra UI with custom Spotify-themed design
- **Authentication**: NextAuth.js with Spotify OAuth provider
- **API**: Spotify Web API
- **Type Safety**: TypeScript with strict mode

## Prerequisites

- Node.js 18+ and npm/yarn (or Docker as an alternative)
- A Spotify account (free or premium)
- Spotify Developer credentials

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Metricify
```

### 2. Set Up Spotify Developer Application

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create an App"
3. Fill in the details:
   - **App Name**: Metricify (or your preferred name)
   - **App Description**: Personal Spotify metrics dashboard
   - **Redirect URI**: `http://localhost:3000/api/auth/callback/spotify`
4. After creating, note your **Client ID** and **Client Secret**

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Spotify credentials:

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

Generate a secure `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 4. Choose Your Setup Method

#### Option A: Standard Node.js Setup (Recommended for Development)

**Install dependencies:**
```bash
npm install
```

**Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Option B: Docker Setup

**Build and run with Docker Compose:**
```bash
docker-compose up
```

The app will be available at [http://localhost:3000](http://localhost:3000).

**To stop the Docker container:**
```bash
docker-compose down
```

## Project Structure

```
metricify/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   └── auth/          # NextAuth configuration
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Home page
│   │   └── providers.tsx      # Chakra UI provider
│   ├── components/            # Reusable React components
│   ├── lib/                   # Utility functions and API clients
│   │   └── spotify.ts         # Spotify API client
│   └── types/                 # TypeScript type definitions
│       ├── next-auth.d.ts     # NextAuth type extensions
│       └── spotify.ts         # Spotify API types
├── .env.local                 # Environment variables (not in git)
├── .env.example               # Example environment file
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies and scripts
└── tsconfig.json              # TypeScript configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Troubleshooting

### Clean Start (Reset Everything)

If you encounter issues, you can completely reset the application:

**1. Stop running processes:**
```bash
docker-compose down  # If using Docker
```

**2. Remove all build artifacts:**
```bash
rm -rf .next node_modules package-lock.json
```

**3. Clean Docker artifacts (if applicable):**
```bash
docker rmi metricify-metricify:latest
docker container prune -f
```

**4. Fresh install:**
```bash
npm install
npm run dev
```

### Common Issues

- **Port 3000 already in use**: Stop any other services running on port 3000 or change the port in `package.json`
- **Spotify OAuth errors**: Verify your redirect URI in the Spotify Developer Dashboard matches exactly: `http://localhost:3000/api/auth/callback/spotify`
- **Environment variables not loading**: Ensure `.env.local` exists and has no syntax errors

## Spotify API Scopes

The app requests the following Spotify permissions:

- `user-read-email` - Read user's email address
- `user-read-private` - Read user's profile information
- `user-top-read` - Read user's top artists and tracks
- `user-read-recently-played` - Read user's recently played tracks
- `user-library-read` - Read user's saved tracks and albums
- `playlist-read-private` - Read user's private playlists
- `user-follow-read` - Read user's followed artists

## Development Roadmap

### Phase 1: Core Metrics (Current)
- [x] Spotify authentication
- [x] Basic UI setup with Chakra UI
- [ ] Top artists display
- [ ] Top tracks display
- [ ] Recently played tracks
- [ ] Listening statistics

### Phase 2: Enhanced Visualizations
- [ ] Genre distribution charts
- [ ] Listening time heatmaps
- [ ] Artist/track popularity trends
- [ ] Audio features analysis

### Phase 3: Festival Integration
- [ ] Festival lineup import
- [ ] Artist matching algorithm
- [ ] Schedule conflict detection
- [ ] Personalized itinerary builder
- [ ] Set time notifications

### Phase 4: Social Features
- [ ] Share your metrics
- [ ] Compare with friends
- [ ] Festival group planning
- [ ] Collaborative schedules

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is for personal use and educational purposes. Spotify API usage is subject to [Spotify's Terms of Service](https://developer.spotify.com/terms).

## Acknowledgments

- Spotify for their comprehensive Web API
- Chakra UI for the beautiful component library
- Next.js team for the amazing framework

---

Built with ❤️ for music lovers and festival goers
