/**
 * Artist Matching Engine
 * Matches Spotify artists with EDMTrain artists using multiple strategies
 */

import { distance as levenshteinDistance } from 'fastest-levenshtein';
import Fuse from 'fuse.js';
import { query } from './db-postgres';
import { ArtistMapping } from '@/types/edmtrain';

/**
 * Normalize artist name for matching
 */
function normalizeArtistName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Remove common prefixes
    .replace(/^(the|dj|djz)\s+/i, '')
    // Remove special characters
    .replace(/[^\w\s]/g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate match confidence (0-1)
 */
function calculateMatchConfidence(
  spotifyName: string,
  edmtrainName: string,
  method: 'exact' | 'normalized' | 'fuzzy'
): number {
  if (method === 'exact') {
    return 1.0;
  }

  const normalized1 = normalizeArtistName(spotifyName);
  const normalized2 = normalizeArtistName(edmtrainName);

  if (normalized1 === normalized2) {
    return 0.95;
  }

  // Use Levenshtein distance
  const maxLength = Math.max(normalized1.length, normalized2.length);
  const distance = levenshteinDistance(normalized1, normalized2);
  const similarity = 1 - distance / maxLength;

  return Math.max(0, Math.min(1, similarity));
}

/**
 * Match strategy: Exact match
 */
function exactMatch(spotifyName: string, edmtrainName: string): boolean {
  return spotifyName.toLowerCase() === edmtrainName.toLowerCase();
}

/**
 * Match strategy: Normalized match
 */
function normalizedMatch(spotifyName: string, edmtrainName: string): boolean {
  return normalizeArtistName(spotifyName) === normalizeArtistName(edmtrainName);
}

/**
 * Match strategy: Fuzzy match (using Levenshtein distance)
 */
function fuzzyMatch(spotifyName: string, edmtrainName: string, threshold: number = 0.85): boolean {
  const confidence = calculateMatchConfidence(spotifyName, edmtrainName, 'fuzzy');
  return confidence >= threshold;
}

/**
 * Artist Matcher Class
 */
export class ArtistMatcher {
  private edmtrainArtistsCache: Map<string, string> = new Map(); // edmtrainId -> name
  private fuseInstance: Fuse<{ id: string; name: string }> | null = null;

  /**
   * Load EDMTrain artists into memory for faster matching
   */
  async loadEDMTrainArtists(artists: { id: string; name: string }[]): Promise<void> {
    this.edmtrainArtistsCache.clear();

    artists.forEach((artist) => {
      this.edmtrainArtistsCache.set(artist.id, artist.name);
    });

    // Initialize Fuse.js for fuzzy searching
    this.fuseInstance = new Fuse(artists, {
      keys: ['name'],
      threshold: 0.3, // Lower = more strict
      ignoreLocation: true,
      minMatchCharLength: 3,
    });

    console.log(`Loaded ${artists.length} EDMTrain artists for matching`);
  }

  /**
   * Match a single Spotify artist to EDMTrain
   */
  async matchArtist(
    spotifyArtistId: string,
    spotifyArtistName: string,
    edmtrainArtists?: { id: string; name: string }[]
  ): Promise<ArtistMapping | null> {
    // Check if already mapped in database
    const existing = await this.getExistingMapping(spotifyArtistId);
    if (existing) {
      return existing;
    }

    // If EDMTrain artists provided, load them
    if (edmtrainArtists && edmtrainArtists.length > 0) {
      await this.loadEDMTrainArtists(edmtrainArtists);
    }

    // Strategy 1: Exact match
    for (const [edmtrainId, edmtrainName] of this.edmtrainArtistsCache) {
      if (exactMatch(spotifyArtistName, edmtrainName)) {
        const mapping = await this.createMapping(
          spotifyArtistId,
          spotifyArtistName,
          edmtrainId,
          edmtrainName,
          'exact',
          1.0
        );
        return mapping;
      }
    }

    // Strategy 2: Normalized match
    for (const [edmtrainId, edmtrainName] of this.edmtrainArtistsCache) {
      if (normalizedMatch(spotifyArtistName, edmtrainName)) {
        const mapping = await this.createMapping(
          spotifyArtistId,
          spotifyArtistName,
          edmtrainId,
          edmtrainName,
          'normalized',
          0.95
        );
        return mapping;
      }
    }

    // Strategy 3: Fuzzy match using Fuse.js
    if (this.fuseInstance) {
      const results = this.fuseInstance.search(spotifyArtistName);

      if (results.length > 0) {
        const bestMatch = results[0];
        const confidence = 1 - (bestMatch.score || 0);

        // Only accept high-confidence fuzzy matches
        if (confidence >= 0.85) {
          const mapping = await this.createMapping(
            spotifyArtistId,
            spotifyArtistName,
            bestMatch.item.id,
            bestMatch.item.name,
            'fuzzy',
            confidence
          );
          return mapping;
        }
      }
    }

    // Strategy 4: Fallback to Levenshtein distance
    let bestMatch: { id: string; name: string; confidence: number } | null = null;

    for (const [edmtrainId, edmtrainName] of this.edmtrainArtistsCache) {
      if (fuzzyMatch(spotifyArtistName, edmtrainName, 0.85)) {
        const confidence = calculateMatchConfidence(
          spotifyArtistName,
          edmtrainName,
          'fuzzy'
        );

        if (!bestMatch || confidence > bestMatch.confidence) {
          bestMatch = { id: edmtrainId, name: edmtrainName, confidence };
        }
      }
    }

    if (bestMatch) {
      const mapping = await this.createMapping(
        spotifyArtistId,
        spotifyArtistName,
        bestMatch.id,
        bestMatch.name,
        'fuzzy',
        bestMatch.confidence
      );
      return mapping;
    }

    console.log(`No match found for Spotify artist: ${spotifyArtistName}`);
    return null;
  }

  /**
   * Match multiple Spotify artists in batch
   */
  async matchArtists(
    spotifyArtists: { id: string; name: string }[],
    edmtrainArtists?: { id: string; name: string }[]
  ): Promise<ArtistMapping[]> {
    if (edmtrainArtists && edmtrainArtists.length > 0) {
      await this.loadEDMTrainArtists(edmtrainArtists);
    }

    const mappings: ArtistMapping[] = [];

    for (const artist of spotifyArtists) {
      try {
        const mapping = await this.matchArtist(artist.id, artist.name);
        if (mapping) {
          mappings.push(mapping);
        }
      } catch (error) {
        console.error(`Error matching artist ${artist.name}:`, error);
      }
    }

    console.log(`Matched ${mappings.length} out of ${spotifyArtists.length} artists`);
    return mappings;
  }

  /**
   * Get existing mapping from database
   */
  private async getExistingMapping(spotifyArtistId: string): Promise<ArtistMapping | null> {
    try {
      const result = await query<ArtistMapping>(
        'SELECT * FROM artist_mappings WHERE spotify_artist_id = $1',
        [spotifyArtistId]
      );

      if (result.rows.length > 0) {
        return this.rowToMapping(result.rows[0]);
      }

      return null;
    } catch (error) {
      console.error('Error fetching existing mapping:', error);
      return null;
    }
  }

  /**
   * Create and store a new mapping
   */
  private async createMapping(
    spotifyArtistId: string,
    spotifyArtistName: string,
    edmtrainArtistId: string,
    edmtrainArtistName: string,
    matchMethod: 'exact' | 'normalized' | 'fuzzy' | 'manual',
    matchConfidence: number
  ): Promise<ArtistMapping> {
    try {
      const result = await query<ArtistMapping>(
        `INSERT INTO artist_mappings
         (spotify_artist_id, spotify_artist_name, edmtrain_artist_id, edmtrain_artist_name, match_confidence, match_method, verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (spotify_artist_id)
         DO UPDATE SET
           edmtrain_artist_id = $3,
           edmtrain_artist_name = $4,
           match_confidence = $5,
           match_method = $6,
           updated_at = NOW()
         RETURNING *`,
        [
          spotifyArtistId,
          spotifyArtistName,
          edmtrainArtistId,
          edmtrainArtistName,
          matchConfidence,
          matchMethod,
          matchMethod === 'exact' || matchMethod === 'manual',
        ]
      );

      return this.rowToMapping(result.rows[0]);
    } catch (error) {
      console.error('Error creating artist mapping:', error);
      throw error;
    }
  }

  /**
   * Convert database row to ArtistMapping object
   */
  private rowToMapping(row: any): ArtistMapping {
    return {
      id: row.id,
      spotifyArtistId: row.spotify_artist_id,
      spotifyArtistName: row.spotify_artist_name,
      edmtrainArtistId: row.edmtrain_artist_id,
      edmtrainArtistName: row.edmtrain_artist_name,
      matchConfidence: row.match_confidence,
      matchMethod: row.match_method,
      verified: row.verified,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Get all mappings for a user's Spotify artists
   */
  async getMappingsForSpotifyArtists(spotifyArtistIds: string[]): Promise<ArtistMapping[]> {
    if (spotifyArtistIds.length === 0) {
      return [];
    }

    try {
      const result = await query<ArtistMapping>(
        'SELECT * FROM artist_mappings WHERE spotify_artist_id = ANY($1)',
        [spotifyArtistIds]
      );

      return result.rows.map((row) => this.rowToMapping(row));
    } catch (error) {
      console.error('Error fetching mappings:', error);
      return [];
    }
  }

  /**
   * Manually create or update a mapping
   */
  async manualMapping(
    spotifyArtistId: string,
    spotifyArtistName: string,
    edmtrainArtistId: string,
    edmtrainArtistName: string
  ): Promise<ArtistMapping> {
    return this.createMapping(
      spotifyArtistId,
      spotifyArtistName,
      edmtrainArtistId,
      edmtrainArtistName,
      'manual',
      1.0
    );
  }

  /**
   * Delete a mapping
   */
  async deleteMapping(spotifyArtistId: string): Promise<void> {
    try {
      await query('DELETE FROM artist_mappings WHERE spotify_artist_id = $1', [
        spotifyArtistId,
      ]);
      console.log(`Deleted mapping for Spotify artist: ${spotifyArtistId}`);
    } catch (error) {
      console.error('Error deleting mapping:', error);
      throw error;
    }
  }

  /**
   * Get all verified mappings
   */
  async getVerifiedMappings(): Promise<ArtistMapping[]> {
    try {
      const result = await query<ArtistMapping>(
        'SELECT * FROM artist_mappings WHERE verified = true ORDER BY spotify_artist_name'
      );

      return result.rows.map((row) => this.rowToMapping(row));
    } catch (error) {
      console.error('Error fetching verified mappings:', error);
      return [];
    }
  }

  /**
   * Get mapping statistics
   */
  async getMappingStats(): Promise<{
    total: number;
    verified: number;
    byMethod: Record<string, number>;
  }> {
    try {
      const totalResult = await query('SELECT COUNT(*) as count FROM artist_mappings');
      const verifiedResult = await query(
        'SELECT COUNT(*) as count FROM artist_mappings WHERE verified = true'
      );
      const methodResult = await query(
        'SELECT match_method, COUNT(*) as count FROM artist_mappings GROUP BY match_method'
      );

      const byMethod: Record<string, number> = {};
      methodResult.rows.forEach((row: any) => {
        byMethod[row.match_method] = parseInt(row.count, 10);
      });

      return {
        total: parseInt(totalResult.rows[0].count, 10),
        verified: parseInt(verifiedResult.rows[0].count, 10),
        byMethod,
      };
    } catch (error) {
      console.error('Error fetching mapping stats:', error);
      return { total: 0, verified: 0, byMethod: {} };
    }
  }
}

/**
 * Create a singleton instance
 */
let artistMatcherInstance: ArtistMatcher | null = null;

export function getArtistMatcher(): ArtistMatcher {
  if (!artistMatcherInstance) {
    artistMatcherInstance = new ArtistMatcher();
  }
  return artistMatcherInstance;
}
