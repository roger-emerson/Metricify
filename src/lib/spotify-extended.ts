import type {
  SpotifyUser,
  SpotifyArtist,
  SpotifyTrack,
  SpotifyTopItems,
  RecentlyPlayedResponse,
  TimeRange,
  AudioFeatures,
  AudioAnalysis,
  SavedAlbum,
  SavedTrack,
  Playlist,
  FollowedArtists,
  SpotifyAlbum,
  ArtistTopTracks,
  RelatedArtists,
} from '@/types/spotify';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export class SpotifyClientExtended {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Spotify API error (${response.status}): ${error}`);
    }

    return response.json();
  }

  // === USER PROFILE ===
  async getCurrentUser(): Promise<SpotifyUser> {
    return this.fetch<SpotifyUser>('/me');
  }

  // === TOP ITEMS (with pagination support) ===
  async getTopArtists(
    timeRange: TimeRange = 'medium_term',
    limit: number = 50,
    offset: number = 0
  ): Promise<SpotifyTopItems<SpotifyArtist>> {
    return this.fetch<SpotifyTopItems<SpotifyArtist>>(
      `/me/top/artists?time_range=${timeRange}&limit=${limit}&offset=${offset}`
    );
  }

  async getTopTracks(
    timeRange: TimeRange = 'medium_term',
    limit: number = 50,
    offset: number = 0
  ): Promise<SpotifyTopItems<SpotifyTrack>> {
    return this.fetch<SpotifyTopItems<SpotifyTrack>>(
      `/me/top/tracks?time_range=${timeRange}&limit=${limit}&offset=${offset}`
    );
  }

  // Get ALL top artists/tracks (paginated)
  async getAllTopArtists(timeRange: TimeRange = 'medium_term'): Promise<SpotifyArtist[]> {
    const results: SpotifyArtist[] = [];
    let offset = 0;
    const limit = 50;

    while (true) {
      const response = await this.getTopArtists(timeRange, limit, offset);
      results.push(...response.items);

      if (!response.next || response.items.length < limit) break;
      offset += limit;
    }

    return results;
  }

  async getAllTopTracks(timeRange: TimeRange = 'medium_term'): Promise<SpotifyTrack[]> {
    const results: SpotifyTrack[] = [];
    let offset = 0;
    const limit = 50;

    while (true) {
      const response = await this.getTopTracks(timeRange, limit, offset);
      results.push(...response.items);

      if (!response.next || response.items.length < limit) break;
      offset += limit;
    }

    return results;
  }

  // === RECENTLY PLAYED ===
  async getRecentlyPlayed(
    limit: number = 50,
    before?: number,
    after?: number
  ): Promise<RecentlyPlayedResponse> {
    let url = `/me/player/recently-played?limit=${limit}`;
    if (before) url += `&before=${before}`;
    if (after) url += `&after=${after}`;
    return this.fetch<RecentlyPlayedResponse>(url);
  }

  // === AUDIO FEATURES - Detailed acoustic analysis ===
  async getAudioFeatures(trackId: string): Promise<AudioFeatures> {
    return this.fetch<AudioFeatures>(`/audio-features/${trackId}`);
  }

  async getMultipleAudioFeatures(trackIds: string[]): Promise<{ audio_features: (AudioFeatures | null)[] }> {
    // Spotify API limits to 100 IDs per request
    const chunks = this.chunkArray(trackIds, 100);
    const allFeatures: (AudioFeatures | null)[] = [];

    for (const chunk of chunks) {
      const response = await this.fetch<{ audio_features: (AudioFeatures | null)[] }>(
        `/audio-features?ids=${chunk.join(',')}`
      );
      allFeatures.push(...response.audio_features);
    }

    return { audio_features: allFeatures };
  }

  // === AUDIO ANALYSIS - Extremely detailed analysis ===
  async getAudioAnalysis(trackId: string): Promise<AudioAnalysis> {
    return this.fetch<AudioAnalysis>(`/audio-analysis/${trackId}`);
  }

  // === SAVED LIBRARY ===
  async getSavedTracks(limit: number = 50, offset: number = 0): Promise<{ items: SavedTrack[]; total: number }> {
    return this.fetch<{ items: SavedTrack[]; total: number }>(
      `/me/tracks?limit=${limit}&offset=${offset}`
    );
  }

  async getAllSavedTracks(): Promise<SavedTrack[]> {
    const results: SavedTrack[] = [];
    let offset = 0;
    const limit = 50;

    while (true) {
      const response = await this.getSavedTracks(limit, offset);
      results.push(...response.items);

      if (response.items.length < limit) break;
      offset += limit;

      // Safety limit
      if (offset >= 2000) break;
    }

    return results;
  }

  async getSavedAlbums(limit: number = 50, offset: number = 0): Promise<{ items: SavedAlbum[]; total: number }> {
    return this.fetch<{ items: SavedAlbum[]; total: number }>(
      `/me/albums?limit=${limit}&offset=${offset}`
    );
  }

  async getAllSavedAlbums(): Promise<SavedAlbum[]> {
    const results: SavedAlbum[] = [];
    let offset = 0;
    const limit = 50;

    while (true) {
      const response = await this.getSavedAlbums(limit, offset);
      results.push(...response.items);

      if (response.items.length < limit) break;
      offset += limit;

      // Safety limit
      if (offset >= 1000) break;
    }

    return results;
  }

  // === PLAYLISTS ===
  async getCurrentUserPlaylists(limit: number = 50, offset: number = 0): Promise<{ items: Playlist[]; total: number }> {
    return this.fetch<{ items: Playlist[]; total: number }>(
      `/me/playlists?limit=${limit}&offset=${offset}`
    );
  }

  async getAllPlaylists(): Promise<Playlist[]> {
    const results: Playlist[] = [];
    let offset = 0;
    const limit = 50;

    while (true) {
      const response = await this.getCurrentUserPlaylists(limit, offset);
      results.push(...response.items);

      if (response.items.length < limit) break;
      offset += limit;

      // Safety limit
      if (offset >= 500) break;
    }

    return results;
  }

  async getPlaylist(playlistId: string): Promise<Playlist> {
    return this.fetch<Playlist>(`/playlists/${playlistId}`);
  }

  // === FOLLOWING ===
  async getFollowedArtists(limit: number = 50, after?: string): Promise<FollowedArtists> {
    let url = `/me/following?type=artist&limit=${limit}`;
    if (after) url += `&after=${after}`;
    return this.fetch<FollowedArtists>(url);
  }

  async getAllFollowedArtists(): Promise<SpotifyArtist[]> {
    const results: SpotifyArtist[] = [];
    let after: string | undefined = undefined;

    while (true) {
      const response = await this.getFollowedArtists(50, after);
      results.push(...response.artists.items);

      if (!response.artists.next) break;
      after = response.artists.cursors.after;
    }

    return results;
  }

  // === ARTIST DETAILS ===
  async getArtist(artistId: string): Promise<SpotifyArtist> {
    return this.fetch<SpotifyArtist>(`/artists/${artistId}`);
  }

  async getArtistTopTracks(artistId: string, market: string = 'US'): Promise<ArtistTopTracks> {
    return this.fetch<ArtistTopTracks>(`/artists/${artistId}/top-tracks?market=${market}`);
  }

  async getArtistAlbums(artistId: string, limit: number = 50): Promise<{ items: SpotifyAlbum[] }> {
    return this.fetch<{ items: SpotifyAlbum[] }>(
      `/artists/${artistId}/albums?limit=${limit}&include_groups=album,single`
    );
  }

  async getRelatedArtists(artistId: string): Promise<RelatedArtists> {
    return this.fetch<RelatedArtists>(`/artists/${artistId}/related-artists`);
  }

  async getMultipleArtists(artistIds: string[]): Promise<{ artists: (SpotifyArtist | null)[] }> {
    const chunks = this.chunkArray(artistIds, 50);
    const allArtists: (SpotifyArtist | null)[] = [];

    for (const chunk of chunks) {
      const response = await this.fetch<{ artists: (SpotifyArtist | null)[] }>(
        `/artists?ids=${chunk.join(',')}`
      );
      allArtists.push(...response.artists);
    }

    return { artists: allArtists };
  }

  // === TRACK DETAILS ===
  async getTrack(trackId: string): Promise<SpotifyTrack> {
    return this.fetch<SpotifyTrack>(`/tracks/${trackId}`);
  }

  async getMultipleTracks(trackIds: string[]): Promise<{ tracks: (SpotifyTrack | null)[] }> {
    const chunks = this.chunkArray(trackIds, 50);
    const allTracks: (SpotifyTrack | null)[] = [];

    for (const chunk of chunks) {
      const response = await this.fetch<{ tracks: (SpotifyTrack | null)[] }>(
        `/tracks?ids=${chunk.join(',')}`
      );
      allTracks.push(...response.tracks);
    }

    return { tracks: allTracks };
  }

  // === ALBUM DETAILS ===
  async getAlbum(albumId: string): Promise<SpotifyAlbum> {
    return this.fetch<SpotifyAlbum>(`/albums/${albumId}`);
  }

  // === UTILITY METHODS ===
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
