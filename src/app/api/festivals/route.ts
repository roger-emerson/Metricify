/**
 * Festivals API Route
 * GET /api/festivals - List all festivals with optional filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db-postgres';
import { Festival, FestivalWithInterest } from '@/types/edmtrain';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const state = searchParams.get('state');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const festivalOnly = searchParams.get('festivalOnly') === 'true';
    const includeInterests = searchParams.get('includeInterests') === 'true';

    // Build query
    let sql = `
      SELECT f.*
      FROM festivals f
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (state) {
      sql += ` AND LOWER(f.state) = LOWER($${paramIndex})`;
      params.push(state);
      paramIndex++;
    }

    if (startDate) {
      sql += ` AND f.start_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      sql += ` AND f.start_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    if (festivalOnly) {
      sql += ` AND f.festival_indicator = true`;
    }

    sql += ` ORDER BY f.start_date ASC`;

    // Execute query
    const result = await query<Festival>(sql, params);

    const festivals: FestivalWithInterest[] = result.rows.map((row) => ({
      id: row.id,
      edmtrainId: row.edmtrain_id,
      name: row.name,
      location: row.location,
      state: row.state,
      city: row.city,
      venueName: row.venue_name,
      venueId: row.venue_id,
      latitude: row.latitude,
      longitude: row.longitude,
      startDate: row.start_date,
      endDate: row.end_date,
      ages: row.ages,
      festivalIndicator: row.festival_indicator,
      livestreamIndicator: row.livestream_indicator,
      link: row.link,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      lastSynced: row.last_synced,
    }));

    // Include user interests if requested
    if (includeInterests && session.user?.spotifyId) {
      const interestsResult = await query(
        `SELECT festival_id, interest_level, interest_score, matched_artists
         FROM user_festival_interests
         WHERE user_id = $1`,
        [session.user.spotifyId]
      );

      const interestsMap = new Map();
      interestsResult.rows.forEach((row: any) => {
        interestsMap.set(row.festival_id, {
          interestLevel: row.interest_level,
          interestScore: row.interest_score,
          matchedArtists: row.matched_artists,
        });
      });

      festivals.forEach((festival) => {
        const interest = interestsMap.get(festival.id);
        if (interest) {
          festival.userInterest = interest as any;
          festival.matchedArtistsCount = interest.matchedArtists;
        }
      });
    }

    return NextResponse.json({
      success: true,
      festivals,
      count: festivals.length,
    });
  } catch (error) {
    console.error('Error fetching festivals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch festivals' },
      { status: 500 }
    );
  }
}
