# Spotify OAuth Setup Guide

## Configure Redirect URI in Spotify Dashboard

To enable Spotify login for Metricify, you need to configure the redirect URI in your Spotify Developer Dashboard.

### Steps:

1. **Go to Spotify Developer Dashboard**
   - Visit: https://developer.spotify.com/dashboard
   - Log in with your Spotify account

2. **Select Your App**
   - Find and click on your app (Client ID: `8c7723957e0a4104b999a6be1340c52a`)

3. **Edit Settings**
   - Click the **"Edit Settings"** button

4. **Add Redirect URI**
   - In the **"Redirect URIs"** section, add:
     ```
     http://127.0.0.1:3000/api/auth/callback/spotify
     ```
   - Click **"Add"**
   - Click **"Save"** at the bottom

5. **Access Your App**
   - Open your browser and go to: http://127.0.0.1:3000
   - Click **"Connect with Spotify"**
   - You'll be redirected to Spotify for authentication
   - After approving, you'll be redirected back to your dashboard

## Dashboard Features

Once authenticated, you'll see:

### Overview Statistics
- Total top artists tracked
- Average popularity of your tracks
- Your top music genre
- Recent unique artists played

### Genre Distribution
- Visual breakdown of your top 10 genres
- Shows how many artists you listen to in each genre

### Top Artists
- View your top 20 artists across different time periods:
  - **Last 4 Weeks** (short_term)
  - **Last 6 Months** (medium_term)
  - **All Time** (long_term)
- See artist images, genres, and follower counts

### Top Tracks
- View your top 20 tracks across different time periods
- See album artwork, artist names, track duration, and popularity

### Recently Played
- Last 50 tracks you've played on Spotify
- Shows when each track was played

## Troubleshooting

### "Redirect URI mismatch" Error
- Make sure you're accessing the app at `http://127.0.0.1:3000` (not `localhost`)
- Verify the redirect URI in Spotify Dashboard matches exactly: `http://127.0.0.1:3000/api/auth/callback/spotify`

### Not Redirecting to Dashboard
- Check that you've approved the Spotify permissions
- Try clearing your browser cache and cookies
- Restart the Docker container: `docker-compose restart`

### API Errors
- Ensure your Spotify app credentials in `.env.local` are correct
- Check that your Spotify account has listening history
