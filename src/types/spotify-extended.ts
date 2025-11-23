import type { SpotifyTrack } from './spotify';

// Spotify Episode type (for podcasts)
export interface SpotifyEpisode {
  id: string;
  name: string;
  description: string;
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
  href: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  language: string;
  languages: string[];
  release_date: string;
  release_date_precision: string;
  type: 'episode';
  uri: string;
}

// Audio Features - Detailed acoustic analysis
export interface AudioFeatures {
  id: string;
  acousticness: number; // 0.0 to 1.0
  danceability: number; // 0.0 to 1.0
  energy: number; // 0.0 to 1.0
  instrumentalness: number; // 0.0 to 1.0
  key: number; // Pitch class notation (0 = C, 1 = C#, etc.)
  liveness: number; // 0.0 to 1.0
  loudness: number; // dB
  mode: number; // 0 = minor, 1 = major
  speechiness: number; // 0.0 to 1.0
  tempo: number; // BPM
  time_signature: number;
  valence: number; // 0.0 to 1.0 (musical positiveness)
  duration_ms: number;
}

// Audio Analysis - Extremely detailed analysis
export interface AudioAnalysis {
  bars: TimeInterval[];
  beats: TimeInterval[];
  sections: Section[];
  segments: Segment[];
  tatums: TimeInterval[];
  track: AnalysisTrack;
}

export interface TimeInterval {
  start: number;
  duration: number;
  confidence: number;
}

export interface Section {
  start: number;
  duration: number;
  confidence: number;
  loudness: number;
  tempo: number;
  tempo_confidence: number;
  key: number;
  key_confidence: number;
  mode: number;
  mode_confidence: number;
  time_signature: number;
  time_signature_confidence: number;
}

export interface Segment {
  start: number;
  duration: number;
  confidence: number;
  loudness_start: number;
  loudness_max: number;
  loudness_max_time: number;
  loudness_end: number;
  pitches: number[];
  timbre: number[];
}

export interface AnalysisTrack {
  duration: number;
  sample_md5: string;
  offset_seconds: number;
  window_seconds: number;
  analysis_sample_rate: number;
  analysis_channels: number;
  end_of_fade_in: number;
  start_of_fade_out: number;
  loudness: number;
  tempo: number;
  tempo_confidence: number;
  time_signature: number;
  time_signature_confidence: number;
  key: number;
  key_confidence: number;
  mode: number;
  mode_confidence: number;
}

// Saved Items
export interface SavedTrack {
  added_at: string;
  track: import('./spotify').SpotifyTrack;
}

export interface SavedAlbum {
  added_at: string;
  album: SpotifyAlbum;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  release_date: string;
  total_tracks: number;
  genres: string[];
  label: string;
  popularity: number;
}

// Playlists
export interface Playlist {
  id: string;
  name: string;
  description: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  owner: {
    id: string;
    display_name: string;
  };
  tracks: {
    total: number;
  };
  public: boolean;
}

// Following
export interface FollowedArtists {
  artists: {
    items: import('./spotify').SpotifyArtist[];
    total: number;
    limit: number;
    next: string | null;
    cursors: {
      after: string;
    };
  };
}

export interface ArtistTopTracks {
  tracks: import('./spotify').SpotifyTrack[];
}

export interface RelatedArtists {
  artists: import('./spotify').SpotifyArtist[];
}

// Listening History Entry for Database
export interface ListeningHistoryEntry {
  id?: number;
  user_id: string;
  track_id: string;
  track_name: string;
  artist_ids: string;
  artist_names: string;
  album_id: string;
  album_name: string;
  played_at: string;
  duration_ms: number;
  acousticness?: number;
  danceability?: number;
  energy?: number;
  instrumentalness?: number;
  key?: number;
  liveness?: number;
  loudness?: number;
  mode?: number;
  speechiness?: number;
  tempo?: number;
  time_signature?: number;
  valence?: number;
  created_at?: string;
}

// Analytics Aggregations
export interface ListeningPattern {
  hour_of_day: number;
  day_of_week: number;
  play_count: number;
  avg_energy: number;
  avg_valence: number;
  avg_tempo: number;
}

export interface GenreEvolution {
  date: string;
  genre: string;
  play_count: number;
  percentage: number;
}

export interface ArtistGrowth {
  artist_id: string;
  artist_name: string;
  week: string;
  play_count: number;
  total_duration_ms: number;
}

// === PLAYBACK & REAL-TIME DATA ===

// Current Playback State
export interface PlaybackState {
  device: Device;
  shuffle_state: boolean;
  repeat_state: 'off' | 'track' | 'context';
  timestamp: number;
  progress_ms: number;
  is_playing: boolean;
  item: SpotifyTrack | SpotifyEpisode | null;
  currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown';
  context: Context | null;
  actions: PlaybackActions;
}

export interface Device {
  id: string | null;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string; // "Computer", "Smartphone", "Speaker", etc.
  volume_percent: number | null;
  supports_volume: boolean;
}

export interface Context {
  type: 'artist' | 'playlist' | 'album' | 'show' | 'collection';
  href: string;
  external_urls: {
    spotify: string;
  };
  uri: string;
}

export interface PlaybackActions {
  disallows: {
    interrupting_playback?: boolean;
    pausing?: boolean;
    resuming?: boolean;
    seeking?: boolean;
    skipping_next?: boolean;
    skipping_prev?: boolean;
    toggling_repeat_context?: boolean;
    toggling_shuffle?: boolean;
    toggling_repeat_track?: boolean;
    transferring_playback?: boolean;
  };
}

// Currently Playing
export interface CurrentlyPlaying {
  timestamp: number;
  context: Context | null;
  progress_ms: number;
  item: SpotifyTrack | SpotifyEpisode | null;
  currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown';
  is_playing: boolean;
  actions: PlaybackActions;
}

// Queue
export interface Queue {
  currently_playing: SpotifyTrack | SpotifyEpisode | null;
  queue: Array<SpotifyTrack | SpotifyEpisode>;
}

// Episode (for podcast support)
export interface SpotifyEpisode {
  id: string;
  name: string;
  description: string;
  duration_ms: number;
  release_date: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  show: {
    id: string;
    name: string;
    publisher: string;
  };
  uri: string;
  external_urls: {
    spotify: string;
  };
}

// === RECOMMENDATIONS ===

export interface RecommendationsResponse {
  seeds: RecommendationSeed[];
  tracks: import('./spotify').SpotifyTrack[];
}

export interface RecommendationSeed {
  afterFilteringSize: number;
  afterRelinkingSize: number;
  href: string | null;
  id: string;
  initialPoolSize: number;
  type: 'artist' | 'track' | 'genre';
}

export interface RecommendationOptions {
  seed_artists?: string[]; // Up to 5 artist IDs
  seed_tracks?: string[]; // Up to 5 track IDs
  seed_genres?: string[]; // Up to 5 genres
  limit?: number; // 1-100, default 20
  market?: string; // ISO 3166-1 alpha-2
  // Tunable track attributes (min/max/target)
  min_acousticness?: number;
  max_acousticness?: number;
  target_acousticness?: number;
  min_danceability?: number;
  max_danceability?: number;
  target_danceability?: number;
  min_energy?: number;
  max_energy?: number;
  target_energy?: number;
  min_instrumentalness?: number;
  max_instrumentalness?: number;
  target_instrumentalness?: number;
  min_key?: number;
  max_key?: number;
  target_key?: number;
  min_liveness?: number;
  max_liveness?: number;
  target_liveness?: number;
  min_loudness?: number;
  max_loudness?: number;
  target_loudness?: number;
  min_mode?: number;
  max_mode?: number;
  target_mode?: number;
  min_popularity?: number;
  max_popularity?: number;
  target_popularity?: number;
  min_speechiness?: number;
  max_speechiness?: number;
  target_speechiness?: number;
  min_tempo?: number;
  max_tempo?: number;
  target_tempo?: number;
  min_time_signature?: number;
  max_time_signature?: number;
  target_time_signature?: number;
  min_valence?: number;
  max_valence?: number;
  target_valence?: number;
}

export interface AvailableGenreSeeds {
  genres: string[];
}

// === PLAYLIST TRACKS ===

export interface PlaylistTrack {
  added_at: string;
  added_by: {
    id: string;
    uri: string;
  };
  is_local: boolean;
  track: import('./spotify').SpotifyTrack;
}

export interface PlaylistTracksResponse {
  href: string;
  items: PlaylistTrack[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}

// === ENHANCED TRACK METADATA ===

export interface EnhancedTrackMetadata {
  id: string;
  name: string;
  popularity: number; // 0-100
  explicit: boolean;
  isrc: string; // International Standard Recording Code
  external_ids?: {
    isrc?: string;
    ean?: string;
    upc?: string;
  };
  external_urls: {
    spotify: string;
  };
  available_markets: string[];
  disc_number: number;
  track_number: number;
  is_local: boolean;
}

// === DATABASE ENTRIES (new tables) ===

export interface PlaybackContextEntry {
  id?: number;
  user_id: string;
  track_id: string;
  played_at: string;
  context_type: 'artist' | 'playlist' | 'album' | 'show' | 'collection' | null;
  context_uri: string | null;
  context_id: string | null;
  shuffle_state: boolean;
  repeat_state: string;
  device_type: string | null;
  device_name: string | null;
  created_at?: string;
}

export interface DeviceHistoryEntry {
  id?: number;
  user_id: string;
  device_id: string | null;
  device_name: string;
  device_type: string;
  first_seen: string;
  last_seen: string;
  total_sessions: number;
  created_at?: string;
}

export interface PlaylistAnalysisEntry {
  id?: number;
  user_id: string;
  playlist_id: string;
  playlist_name: string;
  owner_id: string;
  is_collaborative: boolean;
  is_public: boolean;
  total_tracks: number;
  snapshot_date: string;
  avg_popularity: number | null;
  avg_danceability: number | null;
  avg_energy: number | null;
  avg_valence: number | null;
  unique_artists: number | null;
  genre_diversity: number | null;
  created_at?: string;
}

export interface RecommendationHistoryEntry {
  id?: number;
  user_id: string;
  recommended_track_id: string;
  seed_type: string; // 'artist', 'track', 'genre'
  seed_value: string;
  recommendation_date: string;
  was_played: boolean;
  was_saved: boolean;
  created_at?: string;
}

export interface AlbumPlayStats {
  id?: number;
  user_id: string;
  album_id: string;
  album_name: string;
  artist_id: string;
  artist_name: string;
  total_plays: number;
  unique_tracks_played: number;
  total_tracks_in_album: number;
  completion_percentage: number;
  first_played: string;
  last_played: string;
  created_at?: string;
}
