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
