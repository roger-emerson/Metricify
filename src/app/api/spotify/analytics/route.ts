import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { SpotifyClient } from '@/lib/spotify';
import { authOptions } from '@/lib/auth';
import { metricifyDb } from '@/lib/db';
import type { ListeningHistoryEntry } from '@/types/spotify';

export const dynamic = 'force-dynamic';

// Helper function with retry logic
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delay = 1000
): Promise<T | null> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === retries) {
        console.error(`Failed after ${retries} retries:`, error.message);
        return null;
      }
      if (error.message.includes('429')) {
        // Rate limit - wait longer
        await new Promise(resolve => setTimeout(resolve, delay * (i + 2)));
      } else {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  return null;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Please log in with Spotify' },
      { status: 401 }
    );
  }

  try {
    const spotify = new SpotifyClient(session.accessToken as string);
    const userId = session.user?.email || 'default_user';

    console.log('Fetching optimized analytics...');

    // Fetch core data with retry logic - limit to 20 items each to avoid rate limits
    const [user, recentlyPlayed] = await Promise.all([
      fetchWithRetry(() => spotify.getCurrentUser()),
      fetchWithRetry(() => spotify.getRecentlyPlayed(50)),
    ]);

    if (!user) {
      throw new Error('Failed to fetch user profile');
    }

    // Fetch top items sequentially to avoid rate limits
    const topArtistsShort = await fetchWithRetry(() =>
      spotify.getTopArtists('short_term', 20)
    );
    const topArtistsMedium = await fetchWithRetry(() =>
      spotify.getTopArtists('medium_term', 20)
    );
    const topArtistsLong = await fetchWithRetry(() =>
      spotify.getTopArtists('long_term', 20)
    );

    const topTracksShort = await fetchWithRetry(() =>
      spotify.getTopTracks('short_term', 20)
    );
    const topTracksMedium = await fetchWithRetry(() =>
      spotify.getTopTracks('medium_term', 20)
    );
    const topTracksLong = await fetchWithRetry(() =>
      spotify.getTopTracks('long_term', 20)
    );

    // Collect all track IDs for audio features
    const trackIds = new Set<string>();
    [topTracksShort, topTracksMedium, topTracksLong].forEach((result) => {
      result?.items.forEach((track: any) => trackIds.add(track.id));
    });
    recentlyPlayed?.items.forEach((item: any) => trackIds.add(item.track.id));

    const trackIdsArray = Array.from(trackIds).slice(0, 100); // Limit to 100 tracks

    // Fetch audio features in batches
    let audioFeaturesMap = new Map();
    if (trackIdsArray.length > 0) {
      const batchSize = 50; // Spotify limit
      for (let i = 0; i < trackIdsArray.length; i += batchSize) {
        const batch = trackIdsArray.slice(i, i + batchSize);
        const features = await fetchWithRetry(() =>
          fetch(
            `https://api.spotify.com/v1/audio-features?ids=${batch.join(',')}`,
            {
              headers: { Authorization: `Bearer ${session.accessToken}` },
            }
          ).then((r) => r.json())
        );

        if (features?.audio_features) {
          features.audio_features.forEach((f: any, idx: number) => {
            if (f) audioFeaturesMap.set(batch[idx], f);
          });
        }
        // Small delay between batches
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    // Calculate audio statistics
    const allFeatures = Array.from(audioFeaturesMap.values());
    const audioStats = {
      avgAcousticness: average(allFeatures.map((f: any) => f.acousticness)),
      avgDanceability: average(allFeatures.map((f: any) => f.danceability)),
      avgEnergy: average(allFeatures.map((f: any) => f.energy)),
      avgInstrumentalness: average(allFeatures.map((f: any) => f.instrumentalness)),
      avgLiveness: average(allFeatures.map((f: any) => f.liveness)),
      avgLoudness: average(allFeatures.map((f: any) => f.loudness)),
      avgSpeechiness: average(allFeatures.map((f: any) => f.speechiness)),
      avgTempo: average(allFeatures.map((f: any) => f.tempo)),
      avgValence: average(allFeatures.map((f: any) => f.valence)),
      minTempo: Math.min(...allFeatures.map((f: any) => f.tempo)),
      maxTempo: Math.max(...allFeatures.map((f: any) => f.tempo)),
      minEnergy: Math.min(...allFeatures.map((f: any) => f.energy)),
      maxEnergy: Math.max(...allFeatures.map((f: any) => f.energy)),
    };

    // Genre analysis
    const genreMap = new Map<string, number>();
    [topArtistsShort, topArtistsMedium, topArtistsLong].forEach((result) => {
      result?.items.forEach((artist: any) => {
        artist.genres.forEach((genre: string) => {
          genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
        });
      });
    });

    const topGenres = Array.from(genreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([genre, count]) => ({ genre, count }));

    // Musical analysis
    const tempoRanges = {
      slow: allFeatures.filter((f: any) => f.tempo < 90).length,
      moderate: allFeatures.filter(
        (f: any) => f.tempo >= 90 && f.tempo < 120
      ).length,
      fast: allFeatures.filter((f: any) => f.tempo >= 120 && f.tempo < 150)
        .length,
      veryFast: allFeatures.filter((f: any) => f.tempo >= 150).length,
    };

    // Store in database (non-blocking)
    if (recentlyPlayed) {
      try {
        const historyEntries: Omit<ListeningHistoryEntry, 'id' | 'created_at'>[] =
          recentlyPlayed.items.map((item: any) => {
            const features = audioFeaturesMap.get(item.track.id);
            return {
              user_id: userId,
              track_id: item.track.id,
              track_name: item.track.name,
              artist_ids: item.track.artists.map((a: any) => a.id).join(','),
              artist_names: item.track.artists
                .map((a: any) => a.name)
                .join(', '),
              album_id: item.track.album.id,
              album_name: item.track.album.name,
              played_at: item.played_at,
              duration_ms: item.track.duration_ms,
              acousticness: features?.acousticness,
              danceability: features?.danceability,
              energy: features?.energy,
              instrumentalness: features?.instrumentalness,
              key: features?.key,
              liveness: features?.liveness,
              loudness: features?.loudness,
              mode: features?.mode,
              speechiness: features?.speechiness,
              tempo: features?.tempo,
              time_signature: features?.time_signature,
              valence: features?.valence,
            };
          });

        metricifyDb.bulkInsertListeningHistory(historyEntries);
      } catch (dbError) {
        console.error('Database error (non-fatal):', dbError);
      }
    }

    // Get database analytics (non-blocking errors)
    let dbAnalytics = null;
    try {
      dbAnalytics = {
        listeningPatterns: metricifyDb.getListeningPatterns(userId),
        topTracksHistory: metricifyDb.getTopTracksFromHistory(userId, 50),
        topArtistsHistory: metricifyDb.getTopArtistsFromHistory(userId, 50),
        audioFeatureDistributions: metricifyDb.getAudioFeatureDistributions(userId),
      };
    } catch (dbError) {
      console.error('Database analytics error (non-fatal):', dbError);
    }

    const response = {
      user,
      library: {
        totalSavedTracks: 0,
        totalSavedAlbums: 0,
        totalPlaylists: 0,
        totalFollowedArtists: 0,
      },
      topArtists: {
        short: topArtistsShort?.items || [],
        medium: topArtistsMedium?.items || [],
        long: topArtistsLong?.items || [],
      },
      topTracks: {
        short: topTracksShort?.items || [],
        medium: topTracksMedium?.items || [],
        long: topTracksLong?.items || [],
      },
      recentlyPlayed: recentlyPlayed?.items || [],
      audioFeatures: Object.fromEntries(audioFeaturesMap),
      audioStatistics: audioStats,
      genreAnalysis: {
        topGenres,
        totalUniqueGenres: genreMap.size,
      },
      musicalAnalysis: {
        keyDistribution: {},
        modeDistribution: {},
        tempoRanges,
      },
      savedTracks: [],
      savedAlbums: [],
      playlists: [],
      followedArtists: [],
      databaseAnalytics: dbAnalytics,
    };

    console.log('Analytics fetch complete');
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics',
        message: error.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const validNumbers = numbers.filter((n) => !isNaN(n) && n !== null);
  if (validNumbers.length === 0) return 0;
  return validNumbers.reduce((a, b) => a + b, 0) / validNumbers.length;
}
