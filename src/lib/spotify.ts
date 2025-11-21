import {
  SpotifyUser,
  SpotifyArtist,
  SpotifyTrack,
  SpotifyTopItems,
  RecentlyPlayedResponse,
  TimeRange,
} from '@/types/spotify';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export class SpotifyClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getCurrentUser(): Promise<SpotifyUser> {
    return this.fetch<SpotifyUser>('/me');
  }

  async getTopArtists(
    timeRange: TimeRange = 'medium_term',
    limit: number = 20
  ): Promise<SpotifyTopItems<SpotifyArtist>> {
    return this.fetch<SpotifyTopItems<SpotifyArtist>>(
      `/me/top/artists?time_range=${timeRange}&limit=${limit}`
    );
  }

  async getTopTracks(
    timeRange: TimeRange = 'medium_term',
    limit: number = 20
  ): Promise<SpotifyTopItems<SpotifyTrack>> {
    return this.fetch<SpotifyTopItems<SpotifyTrack>>(
      `/me/top/tracks?time_range=${timeRange}&limit=${limit}`
    );
  }

  async getRecentlyPlayed(
    limit: number = 50
  ): Promise<RecentlyPlayedResponse> {
    return this.fetch<RecentlyPlayedResponse>(
      `/me/player/recently-played?limit=${limit}`
    );
  }

  async getArtist(artistId: string): Promise<SpotifyArtist> {
    return this.fetch<SpotifyArtist>(`/artists/${artistId}`);
  }

  async getTrack(trackId: string): Promise<SpotifyTrack> {
    return this.fetch<SpotifyTrack>(`/tracks/${trackId}`);
  }
}
