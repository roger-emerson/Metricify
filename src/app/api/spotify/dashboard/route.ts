import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { SpotifyClient } from '@/lib/spotify';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const spotify = new SpotifyClient(session.accessToken as string);

    // Fetch all data in parallel for better performance
    const [
      user,
      topArtistsShort,
      topArtistsMedium,
      topArtistsLong,
      topTracksShort,
      topTracksMedium,
      topTracksLong,
      recentlyPlayed,
    ] = await Promise.all([
      spotify.getCurrentUser(),
      spotify.getTopArtists('short_term', 20),
      spotify.getTopArtists('medium_term', 20),
      spotify.getTopArtists('long_term', 20),
      spotify.getTopTracks('short_term', 20),
      spotify.getTopTracks('medium_term', 20),
      spotify.getTopTracks('long_term', 20),
      spotify.getRecentlyPlayed(50),
    ]);

    return NextResponse.json({
      user,
      topArtistsShort: topArtistsShort.items,
      topArtistsMedium: topArtistsMedium.items,
      topArtistsLong: topArtistsLong.items,
      topTracksShort: topTracksShort.items,
      topTracksMedium: topTracksMedium.items,
      topTracksLong: topTracksLong.items,
      recentlyPlayed: recentlyPlayed.items,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Spotify data' },
      { status: 500 }
    );
  }
}
