# Metricify - Granular Metrics Guide

## 🚀 Extreme Granularity Analytics

Your Metricify dashboard now has access to **every possible metric** Spotify provides, with historical tracking via SQLite database.

## 📊 Available Metrics & Endpoints

### 1. **User Profile Metrics**
- Display name, email
- Follower count
- Profile images
- Account type

### 2. **Top Items (All Time Ranges)**
Each metric available for:
- **Short term** (last 4 weeks)
- **Medium term** (last 6 months)
- **Long term** (all time)

**Top Artists:**
- Artist names, genres, images
- Popularity scores
- Follower counts
- Full paginated access (50+ artists per time range)

**Top Tracks:**
- Track names, artists, albums
- Duration, popularity
- Album artwork
- Preview URLs
- Full paginated access (50+ tracks per time range)

### 3. **Audio Features Analysis** (For EVERY Track)
Spotify provides detailed acoustic analysis for each track:

- **Acousticness** (0.0-1.0): Confidence the track is acoustic
- **Danceability** (0.0-1.0): How suitable for dancing
- **Energy** (0.0-1.0): Intensity and activity measure
- **Instrumentalness** (0.0-1.0): Predicts if track has no vocals
- **Liveness** (0.0-1.0): Probability of live audience
- **Loudness** (dB): Overall loudness
- **Speechiness** (0.0-1.0): Presence of spoken words
- **Valence** (0.0-1.0): Musical positiveness/happiness
- **Tempo** (BPM): Estimated tempo
- **Key** (0-11): Pitch class notation (C, C#, D, etc.)
- **Mode** (0-1): Major or minor
- **Time Signature** (3-7): Beats per measure

### 4. **Audio Analysis** (Ultra-Detailed)
For any track, Spotify can provide:
- **Bars**: Time intervals of bars
- **Beats**: Exact beat timings
- **Sections**: Musical sections with key/tempo/mode
- **Segments**: Micro-level analysis with:
  - Loudness contours
  - Pitch content (12 pitch classes)
  - Timbre features (12 dimensions)
- **Tatums**: Smallest rhythmic unit
- **Track metadata**: Fade in/out times, sample rate, etc.

### 5. **Recently Played History**
- Last 50 tracks played
- Exact timestamps
- Play context (album, playlist, etc.)
- **Stored in database for historical analysis**

### 6. **Library Statistics**
- Total saved tracks (with full details)
- Total saved albums
- Total playlists
- Playlist track counts
- Date added timestamps

### 7. **Following Data**
- All followed artists
- Artist details with genres
- Follower counts
- Popularity metrics

### 8. **Genre Analysis**
- All unique genres from your artists
- Genre frequency counts
- Genre distribution percentages
- **Top 20 most listened genres**

### 9. **Musical Analysis**
- **Key Distribution**: Which keys you prefer
- **Mode Distribution**: Major vs Minor preference
- **Tempo Ranges**:
  - Slow (<90 BPM)
  - Moderate (90-120 BPM)
  - Fast (120-150 BPM)
  - Very Fast (>150 BPM)

### 10. **Database-Powered Historical Analytics**

The SQLite database tracks:

#### Listening History Table
Every play stored with:
- Track/artist/album IDs and names
- Exact play timestamp
- Full audio features (12+ metrics)
- User ID for multi-user support

#### Listening Patterns
- **Hour of Day analysis**: When you listen most
- **Day of Week analysis**: Weekend vs weekday patterns
- Average energy/valence/tempo by time
- Play count heatmaps

#### Historical Trends
- Genre evolution over time
- Artist growth tracking
- Play count trends
- Listening time accumulation

#### Aggregated Statistics
- Top tracks by play count
- Top artists by play count
- Total listening time
- Unique track/artist counts
- Audio feature averages over time

### 11. **Artist Deep Dive**
For any artist:
- Top 10 tracks
- All albums and singles
- Related artists
- Full discography

## 🎯 API Endpoints

### `/api/spotify/analytics` - **COMPREHENSIVE**
Returns EVERYTHING in one call:
```json
{
  "user": {...},
  "library": {
    "totalSavedTracks": 1234,
    "totalSavedAlbums": 567,
    "totalPlaylists": 45,
    "totalFollowedArtists": 123
  },
  "topArtists": {
    "short": [...50+ artists],
    "medium": [...50+ artists],
    "long": [...50+ artists]
  },
  "topTracks": {
    "short": [...50+ tracks],
    "medium": [...50+ tracks],
    "long": [...50+ tracks]
  },
  "recentlyPlayed": [...50 tracks],
  "audioFeatures": {
    "track_id_1": {...12+ metrics},
    "track_id_2": {...12+ metrics}
  },
  "audioStatistics": {
    "avgAcousticness": 0.45,
    "avgDanceability": 0.67,
    "avgEnergy": 0.72,
    "avgTempo": 125.4,
    ...
  },
  "genreAnalysis": {
    "topGenres": [...20 genres],
    "totalUniqueGenres": 87
  },
  "musicalAnalysis": {
    "keyDistribution": {...},
    "modeDistribution": {...},
    "tempoRanges": {...}
  },
  "databaseAnalytics": {
    "listeningPatterns": [...],
    "topTracksHistory": [...],
    "topArtistsHistory": [...],
    "audioFeatureDistributions": {...}
  }
}
```

### `/api/spotify/dashboard` - **BASIC**
Original simplified endpoint for quick overview

## 📈 Visualization Opportunities

With this data, you can create:

1. **Time-Based Heatmaps**
   - Listening activity by hour and day
   - Energy levels throughout the week
   - Mood patterns (valence over time)

2. **Audio Feature Radar Charts**
   - Your musical signature
   - Compare different time periods
   - Compare playlists or artists

3. **Genre Evolution Charts**
   - Stacked area charts showing genre shifts
   - Pie charts for current distribution
   - Timeline of new genre discoveries

4. **Tempo/Energy Scatter Plots**
   - Visualize your musical preferences
   - Identify listening patterns
   - Find outliers

5. **Key & Mode Analysis**
   - Musical theory insights
   - Preference patterns
   - Harmonic analysis

6. **Play Count Trends**
   - Track/artist popularity over time
   - Discovery timeline
   - Listening streaks

7. **Listening Time Analytics**
   - Total hours by period
   - Average session length
   - Binge listening detection

## 💾 Database Schema

### `listening_history`
Stores every track play with full audio features

### `artist_plays`
Aggregated artist statistics

### `genre_trends`
Genre listening patterns over time

### `user_statistics`
Daily snapshots of user metrics

## 🎨 Next Steps for Visualizations

The data is ready! You can now build:

1. **Interactive charts** with Recharts/Chart.js
2. **Hover tooltips** showing detailed metrics
3. **Filterable tables** for deep dives
4. **Comparison views** (time periods, playlists)
5. **Export functionality** for data analysis
6. **Trend predictions** using historical data
7. **Spotify Wrapped-style** annual summaries

## 🔗 Access Your Analytics

Visit: **http://127.0.0.1:3000/dashboard**

The analytics endpoint is live and returns all data on every dashboard load, automatically storing your listening history for trend analysis.

## 📝 Notes

- Audio features are fetched for ALL your top tracks and recently played
- Database automatically stores new listening history
- All metrics update in real-time on each dashboard visit
- Historical data accumulates for long-term trend analysis
- Supports multiple users via user_id tracking

This is the most granular Spotify analytics possible! 🎵
