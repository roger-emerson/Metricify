/**
 * EDMTrain API Client
 * Handles all interactions with the EDMTrain API
 * Includes rate limiting, caching, and retry logic
 */

import {
  EDMTrainApiResponse,
  EDMTrainEvent,
  EDMTrainLocation,
  EventSearchParams,
  NearbyEventsParams,
  EDMTrainConfig,
  EDMTrainApiError,
  RateLimitInfo,
} from '@/types/edmtrain';
import { CacheManager } from './db-postgres';

const DEFAULT_BASE_URL = 'https://edmtrain.com/api';
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

/**
 * EDMTrain API Client Class
 */
export class EDMTrainClient {
  private config: Required<EDMTrainConfig>;
  private rateLimitInfo: RateLimitInfo | null = null;

  constructor(config: EDMTrainConfig) {
    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || DEFAULT_BASE_URL,
      timeout: config.timeout || DEFAULT_TIMEOUT,
      maxRetries: config.maxRetries || DEFAULT_MAX_RETRIES,
      retryDelay: config.retryDelay || DEFAULT_RETRY_DELAY,
    };
  }

  /**
   * Make an API request with retry logic and rate limiting
   */
  private async makeRequest<T>(
    endpoint: string,
    params?: Record<string, any>,
    retryCount = 0
  ): Promise<T> {
    // Check rate limit
    if (this.rateLimitInfo && this.rateLimitInfo.remaining === 0) {
      const now = new Date();
      if (now < this.rateLimitInfo.reset) {
        const waitTime = this.rateLimitInfo.reset.getTime() - now.getTime();
        console.warn(`Rate limit hit. Waiting ${waitTime}ms...`);
        await this.sleep(waitTime);
      }
    }

    const url = new URL(`${this.config.baseUrl}${endpoint}`);

    // Add query parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            url.searchParams.append(key, value.join(','));
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Update rate limit info from headers
      this.updateRateLimitInfo(response.headers);

      // Handle rate limiting (429)
      if (response.status === 429) {
        if (retryCount < this.config.maxRetries) {
          const delay = this.config.retryDelay * Math.pow(2, retryCount);
          console.warn(`Rate limited. Retrying in ${delay}ms...`);
          await this.sleep(delay);
          return this.makeRequest<T>(endpoint, params, retryCount + 1);
        }
        throw new EDMTrainApiError('Rate limit exceeded', 429);
      }

      // Handle other errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new EDMTrainApiError(
          errorData.message || `API request failed with status ${response.status}`,
          response.status,
          errorData
        );
      }

      const data: EDMTrainApiResponse<T> = await response.json();

      if (!data.success) {
        throw new EDMTrainApiError(data.message || 'API request failed');
      }

      return data.data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof EDMTrainApiError) {
        throw error;
      }

      // Retry on network errors
      if (retryCount < this.config.maxRetries) {
        const delay = this.config.retryDelay * Math.pow(2, retryCount);
        console.warn(`Request failed. Retrying in ${delay}ms...`, error);
        await this.sleep(delay);
        return this.makeRequest<T>(endpoint, params, retryCount + 1);
      }

      throw new EDMTrainApiError(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }

  /**
   * Update rate limit info from response headers
   */
  private updateRateLimitInfo(headers: Headers): void {
    const limit = headers.get('x-ratelimit-limit');
    const remaining = headers.get('x-ratelimit-remaining');
    const reset = headers.get('x-ratelimit-reset');

    if (limit && remaining && reset) {
      this.rateLimitInfo = {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        reset: new Date(parseInt(reset, 10) * 1000),
      };
    }
  }

  /**
   * Sleep utility for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Search events with parameters
   */
  async searchEvents(params: EventSearchParams): Promise<EDMTrainEvent[]> {
    const cacheKey = `events:search:${JSON.stringify(params)}`;

    // Check cache first (1 hour TTL)
    const cached = await CacheManager.get<EDMTrainEvent[]>(cacheKey);
    if (cached) {
      console.log('Cache hit for event search');
      return cached;
    }

    const events = await this.makeRequest<EDMTrainEvent[]>('/events', params);

    // Cache the results
    await CacheManager.set(cacheKey, events, 3600); // 1 hour

    return events;
  }

  /**
   * Get festivals only (with festival indicator)
   */
  async getFestivals(params: Omit<EventSearchParams, 'festivalInd'> = {}): Promise<EDMTrainEvent[]> {
    return this.searchEvents({
      ...params,
      festivalInd: true,
    });
  }

  /**
   * Get events by artist IDs
   */
  async getEventsByArtists(
    artistIds: string[],
    params: Omit<EventSearchParams, 'artistIds'> = {}
  ): Promise<EDMTrainEvent[]> {
    if (artistIds.length === 0) {
      return [];
    }

    return this.searchEvents({
      ...params,
      artistIds,
    });
  }

  /**
   * Get nearby events based on location
   */
  async getNearbyEvents(params: NearbyEventsParams): Promise<EDMTrainEvent[]> {
    const cacheKey = `events:nearby:${JSON.stringify(params)}`;

    // Check cache first (1 hour TTL)
    const cached = await CacheManager.get<EDMTrainEvent[]>(cacheKey);
    if (cached) {
      console.log('Cache hit for nearby events');
      return cached;
    }

    const events = await this.makeRequest<EDMTrainEvent[]>('/events', {
      latitude: params.latitude,
      longitude: params.longitude,
      radius: params.radius,
      startDate: params.startDate,
      endDate: params.endDate,
    });

    // Cache the results
    await CacheManager.set(cacheKey, events, 3600); // 1 hour

    return events;
  }

  /**
   * Get all locations
   */
  async getLocations(): Promise<EDMTrainLocation[]> {
    const cacheKey = 'locations:all';

    // Check cache first (7 days TTL)
    const cached = await CacheManager.get<EDMTrainLocation[]>(cacheKey);
    if (cached) {
      console.log('Cache hit for locations');
      return cached;
    }

    const locations = await this.makeRequest<EDMTrainLocation[]>('/locations');

    // Cache the results
    await CacheManager.set(cacheKey, locations, 604800); // 7 days

    return locations;
  }

  /**
   * Get US-only events for the next 3 months
   */
  async getUpcomingUSEvents(festivalOnly = false): Promise<EDMTrainEvent[]> {
    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(now.getMonth() + 3);

    const params: EventSearchParams = {
      startDate: now.toISOString().split('T')[0],
      endDate: threeMonthsFromNow.toISOString().split('T')[0],
    };

    if (festivalOnly) {
      params.festivalInd = true;
    }

    // Get US locations
    const locations = await this.getLocations();
    const usLocations = locations.filter((loc) => loc.country === 'United States');
    const usLocationIds = usLocations.map((loc) => loc.id);

    if (usLocationIds.length > 0) {
      params.locationIds = usLocationIds;
    }

    return this.searchEvents(params);
  }

  /**
   * Get upcoming US festivals (convenience method)
   */
  async getUpcomingUSFestivals(): Promise<EDMTrainEvent[]> {
    return this.getUpcomingUSEvents(true);
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    await CacheManager.clearExpired();
    console.log('EDMTrain cache cleared');
  }
}

/**
 * Create a singleton instance of the EDMTrain client
 */
let edmtrainClient: EDMTrainClient | null = null;

export function getEDMTrainClient(): EDMTrainClient {
  if (!edmtrainClient) {
    const apiKey = process.env.EDMTRAIN_API_KEY;

    if (!apiKey) {
      throw new Error('EDMTRAIN_API_KEY environment variable is not set');
    }

    edmtrainClient = new EDMTrainClient({ apiKey });
  }

  return edmtrainClient;
}

/**
 * Helper function to filter US events manually (fallback)
 */
export function filterUSEvents(events: EDMTrainEvent[]): EDMTrainEvent[] {
  return events.filter((event) => {
    const location = event.venue?.location || '';
    // Check if location contains US state abbreviations or common US indicators
    return (
      /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|USA|United States)\b/i.test(
        location
      )
    );
  });
}

/**
 * Helper function to calculate date range
 */
export function getDateRange(
  monthsAhead: number = 3
): { startDate: string; endDate: string } {
  const now = new Date();
  const endDate = new Date();
  endDate.setMonth(now.getMonth() + monthsAhead);

  return {
    startDate: now.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}
