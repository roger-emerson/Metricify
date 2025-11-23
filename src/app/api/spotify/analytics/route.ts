import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { SpotifyClientExtended } from '@/lib/spotify-extended';
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
    const spotify = new SpotifyClientExtended(session.accessToken as string);
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

    // Fetch library data
    const savedTracks = await fetchWithRetry(() =>
      spotify.getSavedTracks(50, 0)
    );
    const savedAlbums = await fetchWithRetry(() =>
      spotify.getSavedAlbums(50, 0)
    );
    const playlists = await fetchWithRetry(() =>
      spotify.getCurrentUserPlaylists(50, 0)
    );
    const followedArtists = await fetchWithRetry(() =>
      spotify.getFollowedArtists(50)
    );

    // Collect all track IDs for audio features (filter out null/undefined/invalid IDs)
    const trackIds = new Set<string>();
    [topTracksShort, topTracksMedium, topTracksLong].forEach((result) => {
      result?.items.forEach((track: any) => {
        if (track?.id && typeof track.id === 'string' && track.id.length > 0) {
          trackIds.add(track.id);
        }
      });
    });
    recentlyPlayed?.items.forEach((item: any) => {
      if (item?.track?.id && typeof item.track.id === 'string' && item.track.id.length > 0) {
        trackIds.add(item.track.id);
      }
    });

    const trackIdsArray = Array.from(trackIds).filter(id => id && id.length > 0).slice(0, 100); // Limit to 100 valid tracks

    console.log(`Collected ${trackIdsArray.length} unique track IDs from top tracks and recently played`);

    // Fetch audio features in batches
    let audioFeaturesMap = new Map();
    let nullCount = 0;
    let successCount = 0;

    console.log(`Fetching audio features for ${trackIdsArray.length} tracks...`);

    if (trackIdsArray.length > 0) {
      const batchSize = 100; // Spotify allows up to 100 IDs per request
      for (let i = 0; i < trackIdsArray.length; i += batchSize) {
        const batch = trackIdsArray.slice(i, i + batchSize);

        try {
          const response = await fetch(
            `https://api.spotify.com/v1/audio-features?ids=${batch.join(',')}`,
            {
              headers: { Authorization: `Bearer ${session.accessToken}` },
            }
          );

          if (!response.ok) {
            console.error(`Audio features batch ${i}-${i + batch.length} failed:`, response.status, response.statusText);
            continue;
          }

          const features = await response.json();

          if (features?.audio_features && Array.isArray(features.audio_features)) {
            features.audio_features.forEach((f: any, idx: number) => {
              if (f && f.id) {
                // Validate that the feature object has the required fields
                if (typeof f.tempo === 'number' && typeof f.energy === 'number') {
                  audioFeaturesMap.set(batch[idx], f);
                  successCount++;
                } else {
                  console.warn(`Track ${batch[idx]} has incomplete audio features:`, f);
                  nullCount++;
                }
              } else {
                nullCount++;
                console.warn(`No audio features for track ${batch[idx]}`);
              }
            });
          }
        } catch (error: any) {
          console.error(`Error fetching audio features batch ${i}:`, error.message);
        }

        // Small delay between batches to avoid rate limiting
        if (i + batchSize < trackIdsArray.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    }

    console.log(`Audio features: ${successCount} successful, ${nullCount} null/invalid out of ${trackIdsArray.length} requested`);

    // Calculate audio statistics with comprehensive validation
    const allFeatures = Array.from(audioFeaturesMap.values()).filter((f: any) => {
      return f !== null &&
             f !== undefined &&
             typeof f === 'object' &&
             typeof f.tempo === 'number' &&
             typeof f.energy === 'number';
    });

    console.log(`Calculating stats from ${allFeatures.length} validated audio features`);

    // Extract and validate all numeric features
    const tempos = allFeatures.map((f: any) => f.tempo).filter((t: number) => !isNaN(t) && t > 0 && t < 300);
    const energies = allFeatures.map((f: any) => f.energy).filter((e: number) => !isNaN(e) && e >= 0 && e <= 1);
    const danceabilities = allFeatures.map((f: any) => f.danceability).filter((d: number) => !isNaN(d) && d >= 0 && d <= 1);
    const valences = allFeatures.map((f: any) => f.valence).filter((v: number) => !isNaN(v) && v >= 0 && v <= 1);
    const acousticnesses = allFeatures.map((f: any) => f.acousticness).filter((a: number) => !isNaN(a) && a >= 0 && a <= 1);

    const audioStats = {
      avgAcousticness: average(acousticnesses),
      avgDanceability: average(danceabilities),
      avgEnergy: average(energies),
      avgInstrumentalness: average(allFeatures.map((f: any) => f.instrumentalness).filter((i: number) => !isNaN(i))),
      avgLiveness: average(allFeatures.map((f: any) => f.liveness).filter((l: number) => !isNaN(l))),
      avgLoudness: average(allFeatures.map((f: any) => f.loudness).filter((l: number) => !isNaN(l))),
      avgSpeechiness: average(allFeatures.map((f: any) => f.speechiness).filter((s: number) => !isNaN(s))),
      avgTempo: average(tempos),
      avgValence: average(valences),
      minTempo: tempos.length > 0 ? Math.min(...tempos) : 0,
      maxTempo: tempos.length > 0 ? Math.max(...tempos) : 0,
      minEnergy: energies.length > 0 ? Math.min(...energies) : 0,
      maxEnergy: energies.length > 0 ? Math.max(...energies) : 0,
      totalTracksAnalyzed: allFeatures.length,
      validTempos: tempos.length,
      validEnergies: energies.length,
      validDanceabilities: danceabilities.length,
    };

    console.log('Audio stats calculated:', {
      totalFeatures: allFeatures.length,
      avgTempo: audioStats.avgTempo,
      avgEnergy: audioStats.avgEnergy,
      avgDanceability: audioStats.avgDanceability,
      validTempos: audioStats.validTempos,
      validEnergies: audioStats.validEnergies,
    });

    // Genre analysis with artist mapping
    const genreMap = new Map<string, { count: number; artists: Set<string> }>();
    [topArtistsShort, topArtistsMedium, topArtistsLong].forEach((result) => {
      result?.items.forEach((artist: any) => {
        artist.genres.forEach((genre: string) => {
          const existing = genreMap.get(genre) || { count: 0, artists: new Set<string>() };
          existing.count += 1;
          existing.artists.add(artist.name);
          genreMap.set(genre, existing);
        });
      });
    });

    const topGenres = Array.from(genreMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 20)
      .map(([genre, data]) => ({
        genre,
        count: data.count,
        artists: Array.from(data.artists)
      }));

    // Musical analysis - Key and Mode distributions
    const keyMap = new Map<number, number>();
    const modeMap = new Map<number, number>();

    allFeatures.forEach((f: any) => {
      if (f.key !== null && f.key !== undefined && f.key >= 0) {
        keyMap.set(f.key, (keyMap.get(f.key) || 0) + 1);
      }
      if (f.mode !== null && f.mode !== undefined) {
        modeMap.set(f.mode, (modeMap.get(f.mode) || 0) + 1);
      }
    });

    const keyNames = ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B'];
    const keyDistribution = Array.from(keyMap.entries())
      .map(([key, count]) => ({ key: keyNames[key] || 'Unknown', count }))
      .sort((a, b) => b.count - a.count);

    const totalModes = (modeMap.get(1) || 0) + (modeMap.get(0) || 0);
    const modeDistribution = {
      major: modeMap.get(1) || 0,
      minor: modeMap.get(0) || 0,
      majorPercentage: totalModes > 0 ? ((modeMap.get(1) || 0) / totalModes) * 100 : 0,
      minorPercentage: totalModes > 0 ? ((modeMap.get(0) || 0) / totalModes) * 100 : 0,
    };

    const slowCount = allFeatures.filter((f: any) => f.tempo && f.tempo < 90).length;
    const moderateCount = allFeatures.filter((f: any) => f.tempo && f.tempo >= 90 && f.tempo < 120).length;
    const fastCount = allFeatures.filter((f: any) => f.tempo && f.tempo >= 120 && f.tempo < 150).length;
    const veryFastCount = allFeatures.filter((f: any) => f.tempo && f.tempo >= 150).length;
    const totalTempoTracks = slowCount + moderateCount + fastCount + veryFastCount;

    const tempoRanges = {
      slow: slowCount,
      moderate: moderateCount,
      fast: fastCount,
      veryFast: veryFastCount,
      total: totalTempoTracks,
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

    // Fetch playback insights data
    const playbackState = await fetchWithRetry(() => spotify.getPlaybackState());
    const currentlyPlaying = await fetchWithRetry(() => spotify.getCurrentlyPlaying());
    const queue = await fetchWithRetry(() => spotify.getQueue());

    // Fetch recommendations based on top artists and tracks
    let recommendations = null;
    try {
      const topArtistIds = topArtistsShort?.items.slice(0, 2).map((a: any) => a.id) || [];
      const topTrackIds = topTracksShort?.items.slice(0, 3).map((t: any) => t.id) || [];

      if (topArtistIds.length > 0 || topTrackIds.length > 0) {
        recommendations = await fetchWithRetry(() =>
          spotify.getRecommendations({
            seed_artists: topArtistIds,
            seed_tracks: topTrackIds,
            limit: 20,
          })
        );
      }
    } catch (error) {
      console.error('Recommendations fetch failed (non-fatal):', error);
    }

    // Get available genre seeds for recommendations
    const genreSeeds = await fetchWithRetry(() => spotify.getAvailableGenreSeeds());

    // Fetch detailed playlist analytics
    const playlistAnalytics = await analyzePlaylistsDetailed(
      spotify,
      playlists?.items || [],
      audioFeaturesMap
    );

    const response = {
      user,
      library: {
        totalSavedTracks: savedTracks?.total || 0,
        totalSavedAlbums: savedAlbums?.total || 0,
        totalPlaylists: playlists?.total || 0,
        totalFollowedArtists: followedArtists?.artists?.total || 0,
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
        keyDistribution,
        modeDistribution,
        tempoRanges,
      },
      savedTracks: savedTracks?.items || [],
      savedAlbums: savedAlbums?.items || [],
      playlists: playlists?.items || [],
      followedArtists: followedArtists?.artists?.items || [],
      databaseAnalytics: dbAnalytics,
      playbackInsights: {
        currentPlayback: playbackState,
        currentlyPlaying: currentlyPlaying,
        queue: queue,
      },
      recommendations: {
        tracks: recommendations?.tracks || [],
        seeds: recommendations?.seeds || [],
        availableGenres: genreSeeds?.genres || [],
      },
      playlistAnalytics: playlistAnalytics,
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

async function analyzePlaylistsDetailed(
  spotify: SpotifyClientExtended,
  playlists: any[],
  audioFeaturesMap: Map<string, any>
) {
  if (!playlists || playlists.length === 0) {
    return {
      totalPlaylists: 0,
      totalTracks: 0,
      ownedPlaylists: 0,
      followedPlaylists: 0,
      collaborativePlaylists: 0,
      averagePlaylistSize: 0,
      topPlaylists: [],
    };
  }

  // Calculate basic stats
  const ownedPlaylists = playlists.filter((p) => p.owner.id === playlists[0]?.owner?.id).length;
  const collaborativePlaylists = playlists.filter((p) => p.collaborative).length;
  const totalTracks = playlists.reduce((sum, p) => sum + (p.tracks?.total || 0), 0);
  const averagePlaylistSize = playlists.length > 0 ? Math.round(totalTracks / playlists.length) : 0;

  // Analyze top playlists (limit to first 5 for performance)
  const topPlaylists = await Promise.all(
    playlists.slice(0, 5).map(async (playlist) => {
      try {
        // Get a sample of tracks from the playlist
        const playlistTracks = await spotify.getPlaylistTracks(playlist.id, 50, 0);
        const trackIds = playlistTracks.items
          .filter((item: any) => item.track?.id)
          .map((item: any) => item.track.id);

        // Calculate audio features for playlist
        const features = trackIds
          .map((id: string) => audioFeaturesMap.get(id))
          .filter((f: any) => f !== null && f !== undefined);

        const avgEnergy = average(features.map((f: any) => f.energy).filter((v: number) => !isNaN(v)));
        const avgDanceability = average(features.map((f: any) => f.danceability).filter((v: number) => !isNaN(v)));
        const avgValence = average(features.map((f: any) => f.valence).filter((v: number) => !isNaN(v)));

        // Count unique genres (from tracks)
        const genreSet = new Set<string>();
        playlistTracks.items.forEach((item: any) => {
          if (item.track?.artists) {
            item.track.artists.forEach((artist: any) => {
              if (artist.genres) {
                artist.genres.forEach((g: string) => genreSet.add(g));
              }
            });
          }
        });

        return {
          id: playlist.id,
          name: playlist.name,
          image: playlist.images?.[0]?.url || null,
          tracks: playlist.tracks?.total || 0,
          owner: playlist.owner?.display_name || 'Unknown',
          collaborative: playlist.collaborative || false,
          avgEnergy: avgEnergy,
          avgDanceability: avgDanceability,
          avgValence: avgValence,
          genreDiversity: genreSet.size,
        };
      } catch (error) {
        console.error(`Error analyzing playlist ${playlist.id}:`, error);
        return {
          id: playlist.id,
          name: playlist.name,
          image: playlist.images?.[0]?.url || null,
          tracks: playlist.tracks?.total || 0,
          owner: playlist.owner?.display_name || 'Unknown',
          collaborative: playlist.collaborative || false,
          avgEnergy: 0,
          avgDanceability: 0,
          avgValence: 0,
          genreDiversity: 0,
        };
      }
    })
  );

  return {
    totalPlaylists: playlists.length,
    totalTracks,
    ownedPlaylists,
    followedPlaylists: playlists.length - ownedPlaylists,
    collaborativePlaylists,
    averagePlaylistSize,
    topPlaylists,
  };
}
