export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  followers: {
    total: number;
  };
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  popularity: number;
  followers: {
    total: number;
  };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
  duration_ms: number;
  popularity: number;
  preview_url: string | null;
}

export interface SpotifyTopItems<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  href: string;
  next: string | null;
  previous: string | null;
}

export interface RecentlyPlayed {
  track: SpotifyTrack;
  played_at: string;
  context: {
    type: string;
    href: string;
    uri: string;
  } | null;
}

export interface RecentlyPlayedResponse {
  items: RecentlyPlayed[];
  next: string | null;
  cursors: {
    after: string;
    before: string;
  };
  limit: number;
  href: string;
}

export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

export interface SpotifyError {
  error: {
    status: number;
    message: string;
  };
}

// Re-export extended types
export * from './spotify-extended';
