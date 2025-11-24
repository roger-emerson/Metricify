/**
 * Festival Detail API Route
 * GET /api/festivals/[id] - Get single festival with lineup and user interest
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db-postgres';
import { Festival, FestivalLineup, UserFestivalInterest } from '@/types/edmtrain';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const festivalId = params.id;

    // Get festival details
    const festivalResult = await query<Festival>(
      'SELECT * FROM festivals WHERE id = $1',
      [festivalId]
    );

    if (festivalResult.rows.length === 0) {
      return NextResponse.json({ error: 'Festival not found' }, { status: 404 });
    }

    const festivalRow = festivalResult.rows[0];
    const festival: Festival = {
      id: festivalRow.id,
      edmtrainId: festivalRow.edmtrain_id,
      name: festivalRow.name,
      location: festivalRow.location,
      state: festivalRow.state,
      city: festivalRow.city,
      venueName: festivalRow.venue_name,
      venueId: festivalRow.venue_id,
      latitude: festivalRow.latitude,
      longitude: festivalRow.longitude,
      startDate: festivalRow.start_date,
      endDate: festivalRow.end_date,
      ages: festivalRow.ages,
      festivalIndicator: festivalRow.festival_indicator,
      livestreamIndicator: festivalRow.livestream_indicator,
      link: festivalRow.link,
      createdAt: festivalRow.created_at,
      updatedAt: festivalRow.updated_at,
      lastSynced: festivalRow.last_synced,
    };

    // Get festival lineup
    const lineupResult = await query<FestivalLineup>(
      'SELECT * FROM festival_lineups WHERE festival_id = $1 ORDER BY artist_name',
      [festivalId]
    );

    const lineup: FestivalLineup[] = lineupResult.rows.map((row) => ({
      id: row.id,
      festivalId: row.festival_id,
      edmtrainArtistId: row.edmtrain_artist_id,
      artistName: row.artist_name,
      b2bIndicator: row.b2b_indicator,
      setTime: row.set_time,
      setDate: row.set_date,
      stage: row.stage,
      createdAt: row.created_at,
    }));

    // Get user interest
    let userInterest: UserFestivalInterest | null = null;
    let matchedArtists: any[] = [];

    if (session.user?.spotifyId) {
      const interestResult = await query<UserFestivalInterest>(
        `SELECT * FROM user_festival_interests
         WHERE user_id = $1 AND festival_id = $2`,
        [session.user.spotifyId, festivalId]
      );

      if (interestResult.rows.length > 0) {
        const interestRow = interestResult.rows[0];
        userInterest = {
          id: interestRow.id,
          userId: interestRow.user_id,
          festivalId: interestRow.festival_id,
          interestLevel: interestRow.interest_level as 'high' | 'medium' | 'low',
          interestScore: interestRow.interest_score,
          matchedArtists: interestRow.matched_artists,
          genreAlignmentScore: interestRow.genre_alignment_score,
          matchedArtistDetails: interestRow.matched_artist_details
            ? JSON.parse(interestRow.matched_artist_details as any)
            : [],
          calculatedAt: interestRow.calculated_at,
        };

        matchedArtists = userInterest.matchedArtistDetails || [];
      }
    }

    return NextResponse.json({
      success: true,
      festival,
      lineup,
      userInterest,
      matchedArtists,
    });
  } catch (error) {
    console.error('Error fetching festival details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch festival details' },
      { status: 500 }
    );
  }
}
