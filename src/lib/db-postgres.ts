import { Pool, PoolClient, QueryResult } from 'pg';

// PostgreSQL connection pool
let pool: Pool | null = null;

/**
 * Get or create PostgreSQL connection pool
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection not established
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
      process.exit(-1);
    });
  }

  return pool;
}

/**
 * Execute a query with parameters
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  const start = Date.now();

  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;

    // Log slow queries
    if (duration > 1000) {
      console.warn('Slow query detected:', { text, duration, rows: res.rowCount });
    }

    return res;
  } catch (error) {
    console.error('Database query error:', { text, params, error });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return await pool.connect();
}

/**
 * Initialize database schema
 */
export async function initializeSchema(): Promise<void> {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Core tables (migrated from SQLite)
    await client.query(`
      CREATE TABLE IF NOT EXISTS listening_history (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id VARCHAR(255) NOT NULL,
        track_id VARCHAR(255) NOT NULL,
        track_name VARCHAR(500),
        artist_ids TEXT[],
        artist_names TEXT[],
        album_id VARCHAR(255),
        album_name VARCHAR(500),
        played_at TIMESTAMP NOT NULL,
        duration_ms INTEGER,
        acousticness FLOAT,
        danceability FLOAT,
        energy FLOAT,
        instrumentalness FLOAT,
        key INTEGER,
        liveness FLOAT,
        loudness FLOAT,
        mode INTEGER,
        speechiness FLOAT,
        tempo FLOAT,
        time_signature INTEGER,
        valence FLOAT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_listening_history_user_played
      ON listening_history(user_id, played_at DESC)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_listening_history_track
      ON listening_history(track_id)
    `);

    // Artist plays aggregation table
    await client.query(`
      CREATE TABLE IF NOT EXISTS artist_plays (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id VARCHAR(255) NOT NULL,
        artist_id VARCHAR(255) NOT NULL,
        artist_name VARCHAR(500),
        play_count INTEGER DEFAULT 0,
        total_duration_ms BIGINT DEFAULT 0,
        last_played TIMESTAMP,
        first_played TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, artist_id)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_artist_plays_user
      ON artist_plays(user_id, play_count DESC)
    `);

    // Genre trends
    await client.query(`
      CREATE TABLE IF NOT EXISTS genre_trends (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id VARCHAR(255) NOT NULL,
        genre VARCHAR(255) NOT NULL,
        play_count INTEGER DEFAULT 0,
        trend_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, genre, trend_date)
      )
    `);

    // User statistics snapshots
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_statistics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id VARCHAR(255) NOT NULL,
        snapshot_date DATE NOT NULL,
        total_tracks_played INTEGER DEFAULT 0,
        total_listening_time_ms BIGINT DEFAULT 0,
        unique_artists INTEGER DEFAULT 0,
        unique_tracks INTEGER DEFAULT 0,
        avg_energy FLOAT,
        avg_valence FLOAT,
        avg_danceability FLOAT,
        avg_tempo FLOAT,
        top_genre VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, snapshot_date)
      )
    `);

    // NEW: Festivals table
    await client.query(`
      CREATE TABLE IF NOT EXISTS festivals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        edmtrain_id VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(500) NOT NULL,
        location VARCHAR(255),
        state VARCHAR(100),
        city VARCHAR(100),
        venue_name VARCHAR(500),
        venue_id VARCHAR(255),
        latitude FLOAT,
        longitude FLOAT,
        start_date DATE NOT NULL,
        end_date DATE,
        ages VARCHAR(50),
        festival_indicator BOOLEAN DEFAULT false,
        livestream_indicator BOOLEAN DEFAULT false,
        link TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        last_synced TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_festivals_dates
      ON festivals(start_date, end_date)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_festivals_location
      ON festivals(state, city)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_festivals_edmtrain_id
      ON festivals(edmtrain_id)
    `);

    // NEW: Festival lineups
    await client.query(`
      CREATE TABLE IF NOT EXISTS festival_lineups (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
        edmtrain_artist_id VARCHAR(255) NOT NULL,
        artist_name VARCHAR(500) NOT NULL,
        b2b_indicator BOOLEAN DEFAULT false,
        set_time TIME,
        set_date DATE,
        stage VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(festival_id, edmtrain_artist_id)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_festival_lineups_festival
      ON festival_lineups(festival_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_festival_lineups_artist
      ON festival_lineups(edmtrain_artist_id)
    `);

    // NEW: Artist mappings (Spotify → EDMTrain)
    await client.query(`
      CREATE TABLE IF NOT EXISTS artist_mappings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        spotify_artist_id VARCHAR(255) UNIQUE NOT NULL,
        spotify_artist_name VARCHAR(500) NOT NULL,
        edmtrain_artist_id VARCHAR(255) NOT NULL,
        edmtrain_artist_name VARCHAR(500),
        match_confidence FLOAT,
        match_method VARCHAR(50),
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_artist_mappings_spotify
      ON artist_mappings(spotify_artist_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_artist_mappings_edmtrain
      ON artist_mappings(edmtrain_artist_id)
    `);

    // NEW: User festival interests
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_festival_interests (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id VARCHAR(255) NOT NULL,
        festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
        interest_level VARCHAR(20),
        interest_score FLOAT,
        matched_artists INTEGER DEFAULT 0,
        genre_alignment_score FLOAT,
        matched_artist_details JSONB,
        calculated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, festival_id)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_interests_user
      ON user_festival_interests(user_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_interests_level
      ON user_festival_interests(user_id, interest_level)
    `);

    // NEW: User itineraries
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_itineraries (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id VARCHAR(255) NOT NULL,
        festival_id UUID REFERENCES festivals(id) ON DELETE CASCADE,
        itinerary_data JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        conflicts JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, festival_id, status)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_itineraries_user
      ON user_itineraries(user_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_itineraries_festival
      ON user_itineraries(festival_id)
    `);

    // NEW: API cache
    await client.query(`
      CREATE TABLE IF NOT EXISTS api_cache (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        cache_key VARCHAR(500) UNIQUE NOT NULL,
        cache_data JSONB NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_api_cache_key
      ON api_cache(cache_key)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_api_cache_expires
      ON api_cache(expires_at)
    `);

    await client.query('COMMIT');
    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to initialize database schema:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Cache management
 */
export class CacheManager {
  /**
   * Get cached data
   */
  static async get<T = any>(key: string): Promise<T | null> {
    try {
      const result = await query<{ cache_data: T }>(
        'SELECT cache_data FROM api_cache WHERE cache_key = $1 AND expires_at > NOW()',
        [key]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0].cache_data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached data with TTL (in seconds)
   */
  static async set(key: string, data: any, ttlSeconds: number): Promise<void> {
    try {
      await query(
        `INSERT INTO api_cache (cache_key, cache_data, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '${ttlSeconds} seconds')
         ON CONFLICT (cache_key)
         DO UPDATE SET cache_data = $2, expires_at = NOW() + INTERVAL '${ttlSeconds} seconds'`,
        [key, JSON.stringify(data)]
      );
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete cached data
   */
  static async delete(key: string): Promise<void> {
    try {
      await query('DELETE FROM api_cache WHERE cache_key = $1', [key]);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Clear expired cache entries
   */
  static async clearExpired(): Promise<void> {
    try {
      const result = await query('DELETE FROM api_cache WHERE expires_at < NOW()');
      console.log(`Cleared ${result.rowCount} expired cache entries`);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}

/**
 * Close the connection pool (for graceful shutdown)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('PostgreSQL connection pool closed');
  }
}
