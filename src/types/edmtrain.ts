/**
 * EDMTrain API Type Definitions
 * Based on: https://edmtrain.com/api-documentation
 */

export interface EDMTrainArtist {
  id: string;
  name: string;
  b2bInd: boolean; // Back-to-back indicator
}

export interface EDMTrainVenue {
  id: string;
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
}

export interface EDMTrainEvent {
  id: string;
  link: string;
  name: string;
  ages: string; // e.g., "18+", "21+", "All Ages"
  venue: EDMTrainVenue;
  artists: EDMTrainArtist[];
  date: string; // ISO date format YYYY-MM-DD
  startTime?: string; // HH:MM:SS (only for livestreams)
  endTime?: string; // HH:MM:SS (only for livestreams)
  festivalInd?: boolean;
  livestreamInd?: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface EDMTrainLocation {
  id: string;
  name: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface EDMTrainApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Event search parameters
 */
export interface EventSearchParams {
  festivalName?: string;
  artistIds?: string | string[];
  venueIds?: string | string[];
  locationIds?: string | string[];
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  createdAt?: string; // ISO timestamp
  festivalInd?: boolean;
  livestreamInd?: boolean;
  includeElectronic?: boolean;
  includeOtherGenres?: boolean;
}

/**
 * Nearby events parameters
 */
export interface NearbyEventsParams {
  latitude: number;
  longitude: number;
  radius: number; // miles or km
  startDate?: string;
  endDate?: string;
}

/**
 * Database models for festivals
 */

export interface Festival {
  id: string;
  edmtrainId: string;
  name: string;
  location: string;
  state: string;
  city: string;
  venueName: string;
  venueId: string;
  latitude?: number;
  longitude?: number;
  startDate: Date;
  endDate?: Date;
  ages: string;
  festivalIndicator: boolean;
  livestreamIndicator: boolean;
  link: string;
  createdAt: Date;
  updatedAt: Date;
  lastSynced: Date;
}

export interface FestivalLineup {
  id: string;
  festivalId: string;
  edmtrainArtistId: string;
  artistName: string;
  b2bIndicator: boolean;
  setTime?: string;
  setDate?: Date;
  stage?: string;
  createdAt: Date;
}

export interface ArtistMapping {
  id: string;
  spotifyArtistId: string;
  spotifyArtistName: string;
  edmtrainArtistId: string;
  edmtrainArtistName: string;
  matchConfidence: number;
  matchMethod: 'exact' | 'normalized' | 'fuzzy' | 'manual';
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserFestivalInterest {
  id: string;
  userId: string;
  festivalId: string;
  interestLevel: 'high' | 'medium' | 'low';
  interestScore: number; // 0-100
  matchedArtists: number;
  genreAlignmentScore: number;
  matchedArtistDetails?: MatchedArtistDetail[];
  calculatedAt: Date;
}

export interface MatchedArtistDetail {
  spotifyArtistId: string;
  spotifyArtistName: string;
  edmtrainArtistId: string;
  edmtrainArtistName: string;
  userPlayCount: number;
  userRank: number; // Position in user's top artists
  isTopArtist: boolean;
  isTopTrackArtist: boolean;
}

export interface UserItinerary {
  id: string;
  userId: string;
  festivalId: string;
  itineraryData: ItinerarySchedule;
  status: 'draft' | 'confirmed' | 'archived';
  conflicts?: ItineraryConflict[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ItinerarySchedule {
  festivalName: string;
  dates: ItineraryDay[];
}

export interface ItineraryDay {
  date: string; // YYYY-MM-DD
  sets: ItinerarySet[];
}

export interface ItinerarySet {
  artistId: string;
  artistName: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  stage?: string;
  priority: 'must-see' | 'want-to-see' | 'maybe';
  notes?: string;
}

export interface ItineraryConflict {
  type: 'time-overlap' | 'stage-distance' | 'priority-clash';
  sets: ItinerarySet[];
  severity: 'high' | 'medium' | 'low';
  suggestion?: string;
}

/**
 * Interest calculation breakdown
 */
export interface InterestScoreBreakdown {
  topArtistsMatch: number; // Max 40 points
  topTracksArtistMatch: number; // Max 30 points
  genreMatch: number; // Max 20 points
  listeningFrequency: number; // Max 10 points
  total: number; // 0-100
}

/**
 * Festival with user interest
 */
export interface FestivalWithInterest extends Festival {
  userInterest?: UserFestivalInterest;
  lineup?: FestivalLineup[];
  matchedArtistsCount?: number;
}

/**
 * API Cache entry
 */
export interface ApiCacheEntry {
  id: string;
  cacheKey: string;
  cacheData: any;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * EDMTrain API client configuration
 */
export interface EDMTrainConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * API error types
 */
export class EDMTrainApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'EDMTrainApiError';
  }
}

/**
 * Rate limit info
 */
export interface RateLimitInfo {
  remaining: number;
  reset: Date;
  limit: number;
}
