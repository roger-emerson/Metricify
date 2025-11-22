import Database from 'better-sqlite3';
import path from 'path';
import { ListeningHistoryEntry } from '@/types/spotify';

const dbPath = path.join(process.cwd(), 'data', 'metricify.db');
let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const fs = require('fs');
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    db = new Database(dbPath);
    initializeDatabase(db);
  }
  return db;
}

function initializeDatabase(database: Database.Database) {
  // Listening history table
  database.exec(`
    CREATE TABLE IF NOT EXISTS listening_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      track_id TEXT NOT NULL,
      track_name TEXT NOT NULL,
      artist_ids TEXT NOT NULL,
      artist_names TEXT NOT NULL,
      album_id TEXT NOT NULL,
      album_name TEXT NOT NULL,
      played_at TEXT NOT NULL,
      duration_ms INTEGER NOT NULL,
      acousticness REAL,
      danceability REAL,
      energy REAL,
      instrumentalness REAL,
      key INTEGER,
      liveness REAL,
      loudness REAL,
      mode INTEGER,
      speechiness REAL,
      tempo REAL,
      time_signature INTEGER,
      valence REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, track_id, played_at)
    )
  `);

  // Create indexes for faster queries
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_user_played_at ON listening_history(user_id, played_at DESC);
    CREATE INDEX IF NOT EXISTS idx_track_id ON listening_history(track_id);
    CREATE INDEX IF NOT EXISTS idx_user_track ON listening_history(user_id, track_id);
  `);

  // Artist plays aggregation table
  database.exec(`
    CREATE TABLE IF NOT EXISTS artist_plays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      artist_id TEXT NOT NULL,
      artist_name TEXT NOT NULL,
      play_count INTEGER DEFAULT 1,
      total_duration_ms INTEGER DEFAULT 0,
      last_played TEXT,
      first_played TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, artist_id)
    )
  `);

  // Genre trends table
  database.exec(`
    CREATE TABLE IF NOT EXISTS genre_trends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      genre TEXT NOT NULL,
      date TEXT NOT NULL,
      play_count INTEGER DEFAULT 1,
      UNIQUE(user_id, genre, date)
    )
  `);

  // User statistics snapshots
  database.exec(`
    CREATE TABLE IF NOT EXISTS user_statistics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      snapshot_date TEXT NOT NULL,
      total_tracks_played INTEGER DEFAULT 0,
      total_listening_time_ms INTEGER DEFAULT 0,
      unique_artists INTEGER DEFAULT 0,
      unique_tracks INTEGER DEFAULT 0,
      avg_energy REAL,
      avg_valence REAL,
      avg_danceability REAL,
      avg_tempo REAL,
      top_genre TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, snapshot_date)
    )
  `);
}

export class MetricifyDB {
  private db: Database.Database;

  constructor() {
    this.db = getDb();
  }

  // Insert listening history entry
  insertListeningHistory(entry: Omit<ListeningHistoryEntry, 'id' | 'created_at'>) {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO listening_history (
        user_id, track_id, track_name, artist_ids, artist_names, album_id, album_name,
        played_at, duration_ms, acousticness, danceability, energy, instrumentalness,
        key, liveness, loudness, mode, speechiness, tempo, time_signature, valence
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(
      entry.user_id,
      entry.track_id,
      entry.track_name,
      entry.artist_ids,
      entry.artist_names,
      entry.album_id,
      entry.album_name,
      entry.played_at,
      entry.duration_ms,
      entry.acousticness,
      entry.danceability,
      entry.energy,
      entry.instrumentalness,
      entry.key,
      entry.liveness,
      entry.loudness,
      entry.mode,
      entry.speechiness,
      entry.tempo,
      entry.time_signature,
      entry.valence
    );
  }

  // Bulk insert listening history
  bulkInsertListeningHistory(entries: Omit<ListeningHistoryEntry, 'id' | 'created_at'>[]) {
    const insert = this.db.prepare(`
      INSERT OR IGNORE INTO listening_history (
        user_id, track_id, track_name, artist_ids, artist_names, album_id, album_name,
        played_at, duration_ms, acousticness, danceability, energy, instrumentalness,
        key, liveness, loudness, mode, speechiness, tempo, time_signature, valence
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = this.db.transaction((items: typeof entries) => {
      for (const entry of items) {
        insert.run(
          entry.user_id,
          entry.track_id,
          entry.track_name,
          entry.artist_ids,
          entry.artist_names,
          entry.album_id,
          entry.album_name,
          entry.played_at,
          entry.duration_ms,
          entry.acousticness,
          entry.danceability,
          entry.energy,
          entry.instrumentalness,
          entry.key,
          entry.liveness,
          entry.loudness,
          entry.mode,
          entry.speechiness,
          entry.tempo,
          entry.time_signature,
          entry.valence
        );
      }
    });

    return transaction(entries);
  }

  // Get listening history with filters
  getListeningHistory(userId: string, limit: number = 100, offset: number = 0) {
    const stmt = this.db.prepare(`
      SELECT * FROM listening_history
      WHERE user_id = ?
      ORDER BY played_at DESC
      LIMIT ? OFFSET ?
    `);

    return stmt.all(userId, limit, offset) as ListeningHistoryEntry[];
  }

  // Get listening patterns by hour and day
  getListeningPatterns(userId: string) {
    const stmt = this.db.prepare(`
      SELECT
        CAST(strftime('%H', played_at) AS INTEGER) as hour_of_day,
        CAST(strftime('%w', played_at) AS INTEGER) as day_of_week,
        COUNT(*) as play_count,
        AVG(energy) as avg_energy,
        AVG(valence) as avg_valence,
        AVG(tempo) as avg_tempo
      FROM listening_history
      WHERE user_id = ?
      GROUP BY hour_of_day, day_of_week
      ORDER BY day_of_week, hour_of_day
    `);

    return stmt.all(userId);
  }

  // Get genre evolution over time
  getGenreEvolution(userId: string, days: number = 30) {
    const stmt = this.db.prepare(`
      SELECT
        DATE(played_at) as date,
        COUNT(*) as play_count
      FROM listening_history
      WHERE user_id = ?
        AND played_at >= datetime('now', '-${days} days')
      GROUP BY date
      ORDER BY date DESC
    `);

    return stmt.all(userId);
  }

  // Get top tracks with play counts
  getTopTracksFromHistory(userId: string, limit: number = 50) {
    const stmt = this.db.prepare(`
      SELECT
        track_id,
        track_name,
        artist_names,
        COUNT(*) as play_count,
        SUM(duration_ms) as total_duration_ms,
        AVG(energy) as avg_energy,
        AVG(valence) as avg_valence,
        AVG(danceability) as avg_danceability,
        MAX(played_at) as last_played
      FROM listening_history
      WHERE user_id = ?
      GROUP BY track_id
      ORDER BY play_count DESC
      LIMIT ?
    `);

    return stmt.all(userId, limit);
  }

  // Get top artists from history
  getTopArtistsFromHistory(userId: string, limit: number = 50) {
    const stmt = this.db.prepare(`
      SELECT
        artist_ids,
        artist_names,
        COUNT(*) as play_count,
        SUM(duration_ms) as total_duration_ms,
        MAX(played_at) as last_played
      FROM listening_history
      WHERE user_id = ?
      GROUP BY artist_ids
      ORDER BY play_count DESC
      LIMIT ?
    `);

    return stmt.all(userId, limit);
  }

  // Get audio feature distributions
  getAudioFeatureDistributions(userId: string) {
    const stmt = this.db.prepare(`
      SELECT
        AVG(acousticness) as avg_acousticness,
        AVG(danceability) as avg_danceability,
        AVG(energy) as avg_energy,
        AVG(instrumentalness) as avg_instrumentalness,
        AVG(liveness) as avg_liveness,
        AVG(speechiness) as avg_speechiness,
        AVG(valence) as avg_valence,
        AVG(tempo) as avg_tempo,
        AVG(loudness) as avg_loudness,
        MIN(tempo) as min_tempo,
        MAX(tempo) as max_tempo,
        MIN(energy) as min_energy,
        MAX(energy) as max_energy
      FROM listening_history
      WHERE user_id = ?
    `);

    return stmt.get(userId);
  }

  // Get listening stats for date range
  getListeningStats(userId: string, startDate: string, endDate: string) {
    const stmt = this.db.prepare(`
      SELECT
        COUNT(*) as total_plays,
        COUNT(DISTINCT track_id) as unique_tracks,
        COUNT(DISTINCT artist_ids) as unique_artists,
        SUM(duration_ms) as total_duration_ms,
        AVG(energy) as avg_energy,
        AVG(valence) as avg_valence,
        AVG(danceability) as avg_danceability
      FROM listening_history
      WHERE user_id = ?
        AND played_at >= ?
        AND played_at <= ?
    `);

    return stmt.get(userId, startDate, endDate);
  }

  close() {
    if (db) {
      db.close();
      db = null;
    }
  }
}

export const metricifyDb = new MetricifyDB();
