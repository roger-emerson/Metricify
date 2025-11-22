import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { SpotifyClientExtended } from '@/lib/spotify-extended';
import { authOptions } from '@/lib/auth';
import { metricifyDb } from '@/lib/db';
import type { AudioFeatures, ListeningHistoryEntry } from '@/types/spotify';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const spotify = new SpotifyClientExtended(session.accessToken as string);
    const userId = session.user?.email || 'default_user';

    console.log('Starting comprehensive analytics fetch...');

    // Fetch ALL data in parallel
    const [
      user,
      // Top items for all time ranges
      topArtistsShort,
      topArtistsMedium,
      topArtistsLong,
      topTracksShort,
      topTracksMedium,
      topTracksLong,
      // Recently played
      recentlyPlayed,
      // Library
      savedTracks,
      savedAlbums,
      playlists,
      followedArtists,
    ] = await Promise.all([
      spotify.getCurrentUser(),
      spotify.getAllTopArtists('short_term'),
      spotify.getAllTopArtists('medium_term'),
      spotify.getAllTopArtists('long_term'),
      spotify.getAllTopTracks('short_term'),
      spotify.getAllTopTracks('medium_term'),
      spotify.getAllTopTracks('long_term'),
      spotify.getRecentlyPlayed(50),
      spotify.getSavedTracks(50, 0),
      spotify.getSavedAlbums(50, 0),
      spotify.getCurrentUserPlaylists(50, 0),
      spotify.getFollowedArtists(50),
    ]);

    console.log('Basic data fetched, now fetching audio features...');

    // Get audio features for all top tracks
    const allTopTrackIds = new Set<string>();
    topTracksShort.forEach(t => allTopTrackIds.add(t.id));
    topTracksMedium.forEach(t => allTopTrackIds.add(t.id));
    topTracksLong.forEach(t => allTopTrackIds.add(t.id));
    recentlyPlayed.items.forEach(item => allTopTrackIds.add(item.track.id));

    const trackIdsArray = Array.from(allTopTrackIds);
    const audioFeaturesResponse = await spotify.getMultipleAudioFeatures(trackIdsArray);

    // Create a map of track ID to audio features
    const audioFeaturesMap = new Map<string, AudioFeatures>();
    audioFeaturesResponse.audio_features.forEach((features, index) => {
      if (features) {
        audioFeaturesMap.set(trackIdsArray[index], features);
      }
    });

    console.log(`Fetched audio features for ${audioFeaturesMap.size} tracks`);

    // Store listening history in database
    const historyEntries: Omit<ListeningHistoryEntry, 'id' | 'created_at'>[] = recentlyPlayed.items.map(item => {
      const features = audioFeaturesMap.get(item.track.id);
      return {
        user_id: userId,
        track_id: item.track.id,
        track_name: item.track.name,
        artist_ids: item.track.artists.map(a => a.id).join(','),
        artist_names: item.track.artists.map(a => a.name).join(', '),
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

    try {
      metricifyDb.bulkInsertListeningHistory(historyEntries);
      console.log(`Stored ${historyEntries.length} listening history entries`);
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue even if database fails
    }

    // Calculate advanced statistics
    const allAudioFeatures = Array.from(audioFeaturesMap.values());

    const audioStats = {
      avgAcousticness: average(allAudioFeatures.map(f => f.acousticness)),
      avgDanceability: average(allAudioFeatures.map(f => f.danceability)),
      avgEnergy: average(allAudioFeatures.map(f => f.energy)),
      avgInstrumentalness: average(allAudioFeatures.map(f => f.instrumentalness)),
      avgLiveness: average(allAudioFeatures.map(f => f.liveness)),
      avgLoudness: average(allAudioFeatures.map(f => f.loudness)),
      avgSpeechiness: average(allAudioFeatures.map(f => f.speechiness)),
      avgTempo: average(allAudioFeatures.map(f => f.tempo)),
      avgValence: average(allAudioFeatures.map(f => f.valence)),
      minTempo: Math.min(...allAudioFeatures.map(f => f.tempo)),
      maxTempo: Math.max(...allAudioFeatures.map(f => f.tempo)),
      minEnergy: Math.min(...allAudioFeatures.map(f => f.energy)),
      maxEnergy: Math.max(...allAudioFeatures.map(f => f.energy)),
    };

    // Genre analysis
    const genreMap = new Map<string, number>();
    [...topArtistsShort, ...topArtistsMedium, ...topArtistsLong].forEach(artist => {
      artist.genres.forEach(genre => {
        genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
      });
    });

    const topGenres = Array.from(genreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([genre, count]) => ({ genre, count }));

    // Key and mode analysis
    const keyDistribution = new Map<number, number>();
    const modeDistribution = new Map<number, number>();

    allAudioFeatures.forEach(features => {
      keyDistribution.set(features.key, (keyDistribution.get(features.key) || 0) + 1);
      modeDistribution.set(features.mode, (modeDistribution.get(features.mode) || 0) + 1);
    });

    // Tempo range analysis
    const tempoRanges = {
      slow: allAudioFeatures.filter(f => f.tempo < 90).length,
      moderate: allAudioFeatures.filter(f => f.tempo >= 90 && f.tempo < 120).length,
      fast: allAudioFeatures.filter(f => f.tempo >= 120 && f.tempo < 150).length,
      veryFast: allAudioFeatures.filter(f => f.tempo >= 150).length,
    };

    // Get database analytics
    let dbAnalytics = null;
    try {
      dbAnalytics = {
        listeningPatterns: metricifyDb.getListeningPatterns(userId),
        topTracksHistory: metricifyDb.getTopTracksFromHistory(userId, 50),
        topArtistsHistory: metricifyDb.getTopArtistsFromHistory(userId, 50),
        audioFeatureDistributions: metricifyDb.getAudioFeatureDistributions(userId),
      };
    } catch (dbError) {
      console.error('Database analytics error:', dbError);
    }

    const response = {
      user,
      library: {
        totalSavedTracks: savedTracks.total,
        totalSavedAlbums: savedAlbums.total,
        totalPlaylists: playlists.items.length,
        totalFollowedArtists: followedArtists.artists.total,
      },
      topArtists: {
        short: topArtistsShort,
        medium: topArtistsMedium,
        long: topArtistsLong,
      },
      topTracks: {
        short: topTracksShort,
        medium: topTracksMedium,
        long: topTracksLong,
      },
      recentlyPlayed: recentlyPlayed.items,
      audioFeatures: Object.fromEntries(audioFeaturesMap),
      audioStatistics: audioStats,
      genreAnalysis: {
        topGenres,
        totalUniqueGenres: genreMap.size,
      },
      musicalAnalysis: {
        keyDistribution: Object.fromEntries(keyDistribution),
        modeDistribution: Object.fromEntries(modeDistribution),
        tempoRanges,
      },
      savedTracks: savedTracks.items.slice(0, 20),
      savedAlbums: savedAlbums.items.slice(0, 20),
      playlists: playlists.items,
      followedArtists: followedArtists.artists.items,
      databaseAnalytics: dbAnalytics,
    };

    console.log('Analytics complete');
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}
