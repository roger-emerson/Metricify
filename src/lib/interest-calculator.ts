/**
 * Interest Calculation Service
 * Calculates user interest in festivals based on their Spotify listening data
 */

import { query } from './db-postgres';
import { getArtistMatcher } from './matching';
import {
  UserFestivalInterest,
  Festival,
  FestivalLineup,
  InterestScoreBreakdown,
  MatchedArtistDetail,
} from '@/types/edmtrain';

// Spotify types
interface SpotifyArtist {
  id: string;
  name: string;
}

interface SpotifyTopArtist extends SpotifyArtist {
  rank?: number;
}

interface SpotifyTopTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
}

interface UserListeningData {
  topArtists: SpotifyTopArtist[];
  topTracks: SpotifyTopTrack[];
  topGenres: string[];
  recentPlayCounts: Record<string, number>; // artistId -> playCount
}

/**
 * Interest Calculator Class
 */
export class InterestCalculator {
  private matcher = getArtistMatcher();

  /**
   * Calculate interest score for a single festival
   */
  async calculateFestivalInterest(
    userId: string,
    festivalId: string,
    listeningData: UserListeningData
  ): Promise<UserFestivalInterest | null> {
    try {
      // Get festival lineup
      const lineup = await this.getFestivalLineup(festivalId);
      if (lineup.length === 0) {
        console.log(`No lineup found for festival ${festivalId}`);
        return null;
      }

      // Get EDMTrain artist IDs from lineup
      const edmtrainArtistIds = lineup.map((artist) => artist.edmtrainArtistId);

      // Get Spotify artist IDs from user's listening data
      const spotifyArtistIds = [
        ...listeningData.topArtists.map((a) => a.id),
        ...listeningData.topTracks.flatMap((t) => t.artists.map((a) => a.id)),
      ];

      // Get existing artist mappings
      const mappings = await this.matcher.getMappingsForSpotifyArtists(spotifyArtistIds);

      // Find matched artists
      const matchedArtists = mappings.filter((mapping) =>
        edmtrainArtistIds.includes(mapping.edmtrainArtistId)
      );

      if (matchedArtists.length === 0) {
        console.log(`No artist matches for festival ${festivalId}`);
        return null;
      }

      // Calculate detailed breakdown
      const breakdown = this.calculateScoreBreakdown(
        listeningData,
        matchedArtists.map((m) => m.spotifyArtistId),
        lineup
      );

      // Generate matched artist details
      const matchedArtistDetails = this.generateMatchedArtistDetails(
        matchedArtists,
        listeningData
      );

      // Calculate genre alignment
      const festivalGenres = await this.inferFestivalGenres(lineup, listeningData.topArtists);
      const genreAlignmentScore = this.calculateGenreAlignment(
        listeningData.topGenres,
        festivalGenres
      );

      // Determine interest level
      const totalScore = breakdown.total;
      let interestLevel: 'high' | 'medium' | 'low';

      if (totalScore >= 60) {
        interestLevel = 'high';
      } else if (totalScore >= 30) {
        interestLevel = 'medium';
      } else {
        interestLevel = 'low';
      }

      // Create interest record
      const interest: UserFestivalInterest = {
        id: '', // Will be set by database
        userId,
        festivalId,
        interestLevel,
        interestScore: totalScore,
        matchedArtists: matchedArtists.length,
        genreAlignmentScore,
        matchedArtistDetails,
        calculatedAt: new Date(),
      };

      // Store in database
      await this.storeInterest(interest);

      return interest;
    } catch (error) {
      console.error('Error calculating festival interest:', error);
      return null;
    }
  }

  /**
   * Calculate interest scores for multiple festivals
   */
  async calculateInterestsForFestivals(
    userId: string,
    festivalIds: string[],
    listeningData: UserListeningData
  ): Promise<UserFestivalInterest[]> {
    const interests: UserFestivalInterest[] = [];

    for (const festivalId of festivalIds) {
      try {
        const interest = await this.calculateFestivalInterest(
          userId,
          festivalId,
          listeningData
        );

        if (interest) {
          interests.push(interest);
        }
      } catch (error) {
        console.error(`Error calculating interest for festival ${festivalId}:`, error);
      }
    }

    console.log(`Calculated interests for ${interests.length} festivals`);
    return interests;
  }

  /**
   * Calculate score breakdown
   */
  private calculateScoreBreakdown(
    listeningData: UserListeningData,
    matchedSpotifyArtistIds: string[],
    lineup: FestivalLineup[]
  ): InterestScoreBreakdown {
    // 1. Top Artists Match (40 points max)
    const topArtistMatches = listeningData.topArtists
      .filter((artist) => matchedSpotifyArtistIds.includes(artist.id))
      .slice(0, 5); // Top 5 matches
    const topArtistsMatch = Math.min(topArtistMatches.length * 8, 40);

    // 2. Top Tracks Artist Match (30 points max)
    const topTrackArtists = new Set<string>();
    listeningData.topTracks.forEach((track) => {
      track.artists.forEach((artist) => {
        if (matchedSpotifyArtistIds.includes(artist.id)) {
          topTrackArtists.add(artist.id);
        }
      });
    });
    const uniqueTopTrackArtists = Math.min(topTrackArtists.size, 5);
    const topTracksArtistMatch = uniqueTopTrackArtists * 6;

    // 3. Genre Match (20 points max) - Calculated separately
    const genreMatch = 0; // Will be updated with genre alignment

    // 4. Listening Frequency (10 points max)
    let frequencyScore = 0;
    matchedSpotifyArtistIds.forEach((artistId) => {
      const playCount = listeningData.recentPlayCounts[artistId] || 0;
      // More plays = higher score (capped at 2 points per artist, max 5 artists)
      frequencyScore += Math.min(playCount / 10, 2);
    });
    const listeningFrequency = Math.min(frequencyScore, 10);

    const total = topArtistsMatch + topTracksArtistMatch + genreMatch + listeningFrequency;

    return {
      topArtistsMatch,
      topTracksArtistMatch,
      genreMatch,
      listeningFrequency,
      total,
    };
  }

  /**
   * Generate matched artist details
   */
  private generateMatchedArtistDetails(
    mappings: any[],
    listeningData: UserListeningData
  ): MatchedArtistDetail[] {
    return mappings.map((mapping) => {
      const topArtist = listeningData.topArtists.find((a) => a.id === mapping.spotifyArtistId);
      const topTrackArtist = listeningData.topTracks.some((t) =>
        t.artists.some((a) => a.id === mapping.spotifyArtistId)
      );

      return {
        spotifyArtistId: mapping.spotifyArtistId,
        spotifyArtistName: mapping.spotifyArtistName,
        edmtrainArtistId: mapping.edmtrainArtistId,
        edmtrainArtistName: mapping.edmtrainArtistName,
        userPlayCount: listeningData.recentPlayCounts[mapping.spotifyArtistId] || 0,
        userRank: topArtist?.rank || 0,
        isTopArtist: !!topArtist,
        isTopTrackArtist: topTrackArtist,
      };
    });
  }

  /**
   * Infer festival genres from lineup
   */
  private async inferFestivalGenres(
    lineup: FestivalLineup[],
    topArtists: SpotifyTopArtist[]
  ): Promise<string[]> {
    // This is a simplified version - in production, you might want to:
    // 1. Fetch genre data from Spotify for lineup artists
    // 2. Use a genre classification model
    // 3. Store genre data in the database

    // For now, we'll use a basic heuristic:
    // If the user's top genres include EDM-related genres, assume festival alignment
    return ['electronic', 'edm', 'house', 'techno', 'dubstep', 'trance'];
  }

  /**
   * Calculate genre alignment score (0-20 points)
   */
  private calculateGenreAlignment(
    userGenres: string[],
    festivalGenres: string[]
  ): number {
    if (userGenres.length === 0 || festivalGenres.length === 0) {
      return 0;
    }

    const normalizedUserGenres = userGenres.map((g) => g.toLowerCase());
    const normalizedFestivalGenres = festivalGenres.map((g) => g.toLowerCase());

    let matches = 0;
    normalizedFestivalGenres.forEach((festivalGenre) => {
      if (normalizedUserGenres.some((userGenre) => userGenre.includes(festivalGenre))) {
        matches++;
      }
    });

    // 4 points per matching genre, max 5 genres = 20 points
    return Math.min(matches * 4, 20);
  }

  /**
   * Get festival lineup from database
   */
  private async getFestivalLineup(festivalId: string): Promise<FestivalLineup[]> {
    try {
      const result = await query<FestivalLineup>(
        'SELECT * FROM festival_lineups WHERE festival_id = $1',
        [festivalId]
      );

      return result.rows.map((row) => ({
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
    } catch (error) {
      console.error('Error fetching festival lineup:', error);
      return [];
    }
  }

  /**
   * Store interest in database
   */
  private async storeInterest(interest: UserFestivalInterest): Promise<void> {
    try {
      await query(
        `INSERT INTO user_festival_interests
         (user_id, festival_id, interest_level, interest_score, matched_artists, genre_alignment_score, matched_artist_details, calculated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT (user_id, festival_id)
         DO UPDATE SET
           interest_level = $3,
           interest_score = $4,
           matched_artists = $5,
           genre_alignment_score = $6,
           matched_artist_details = $7,
           calculated_at = NOW()`,
        [
          interest.userId,
          interest.festivalId,
          interest.interestLevel,
          interest.interestScore,
          interest.matchedArtists,
          interest.genreAlignmentScore,
          JSON.stringify(interest.matchedArtistDetails),
        ]
      );
    } catch (error) {
      console.error('Error storing interest:', error);
      throw error;
    }
  }

  /**
   * Get user's festival interests
   */
  async getUserInterests(userId: string): Promise<UserFestivalInterest[]> {
    try {
      const result = await query<UserFestivalInterest>(
        `SELECT * FROM user_festival_interests
         WHERE user_id = $1
         ORDER BY interest_score DESC`,
        [userId]
      );

      return result.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        festivalId: row.festival_id,
        interestLevel: row.interest_level as 'high' | 'medium' | 'low',
        interestScore: row.interest_score,
        matchedArtists: row.matched_artists,
        genreAlignmentScore: row.genre_alignment_score,
        matchedArtistDetails: row.matched_artist_details
          ? JSON.parse(row.matched_artist_details as any)
          : [],
        calculatedAt: row.calculated_at,
      }));
    } catch (error) {
      console.error('Error fetching user interests:', error);
      return [];
    }
  }

  /**
   * Get interests by level
   */
  async getUserInterestsByLevel(
    userId: string,
    level: 'high' | 'medium' | 'low'
  ): Promise<UserFestivalInterest[]> {
    try {
      const result = await query<UserFestivalInterest>(
        `SELECT * FROM user_festival_interests
         WHERE user_id = $1 AND interest_level = $2
         ORDER BY interest_score DESC`,
        [userId, level]
      );

      return result.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        festivalId: row.festival_id,
        interestLevel: row.interest_level as 'high' | 'medium' | 'low',
        interestScore: row.interest_score,
        matchedArtists: row.matched_artists,
        genreAlignmentScore: row.genre_alignment_score,
        matchedArtistDetails: row.matched_artist_details
          ? JSON.parse(row.matched_artist_details as any)
          : [],
        calculatedAt: row.calculated_at,
      }));
    } catch (error) {
      console.error('Error fetching interests by level:', error);
      return [];
    }
  }

  /**
   * Recalculate all interests for a user
   */
  async recalculateUserInterests(
    userId: string,
    listeningData: UserListeningData
  ): Promise<void> {
    try {
      // Get all upcoming festivals
      const festivalsResult = await query<Festival>(
        `SELECT id FROM festivals
         WHERE start_date >= CURRENT_DATE
         ORDER BY start_date`
      );

      const festivalIds = festivalsResult.rows.map((row) => row.id);

      // Calculate interests for all festivals
      await this.calculateInterestsForFestivals(userId, festivalIds, listeningData);

      console.log(`Recalculated interests for user ${userId}`);
    } catch (error) {
      console.error('Error recalculating user interests:', error);
      throw error;
    }
  }
}

/**
 * Create singleton instance
 */
let interestCalculatorInstance: InterestCalculator | null = null;

export function getInterestCalculator(): InterestCalculator {
  if (!interestCalculatorInstance) {
    interestCalculatorInstance = new InterestCalculator();
  }
  return interestCalculatorInstance;
}
