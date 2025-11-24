# EDMTrain API Reference

**Version:** 1.0
**Base URL:** `https://edmtrain.com/api`
**Documentation:** https://edmtrain.com/api-documentation

---

## Authentication

All API requests require a **client API key**.

- **Header:** Include API key in request headers
- **Application:** Apply for API key through EDMTrain Developer API page
- **Rate Limits:** Not documented (recommend implementing conservative rate limiting)

---

## Endpoints

### 1. Event Search API

**Endpoint:** `/events`
**Method:** `GET`
**Description:** Retrieves upcoming EDM events with extensive filtering capabilities

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `festivalName` | string | Filter by event/festival name |
| `artistIds` | string/array | Filter by specific artist IDs |
| `venueIds` | string/array | Filter by venue IDs |
| `locationIds` | string/array | Filter by location IDs |
| `startDate` | date | Filter events starting from this date |
| `endDate` | date | Filter events ending before this date |
| `createdAt` | timestamp | Filter by creation date (UTC) |
| `festivalInd` | boolean | Filter for festivals only |
| `livestreamInd` | boolean | Filter for livestream events |
| `includeElectronic` | boolean | Include electronic music events |
| `includeOtherGenres` | boolean | Include non-electronic genres |

#### Response Format

```json
{
  "success": true,
  "message": "Success message or error details",
  "data": [
    {
      "id": "event_id",
      "link": "https://edmtrain.com/event/...",
      "name": "Event Name",
      "ages": "18+",
      "venue": {
        "id": "venue_id",
        "name": "Venue Name",
        "location": "City, State/Country"
      },
      "artists": [
        {
          "id": "artist_id",
          "name": "Artist Name",
          "b2bInd": false
        }
      ],
      "date": "2025-01-23",
      "startTime": "20:00:00",
      "endTime": "03:00:00",
      "createdAt": "2025-01-01T12:00:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

#### Notes
- **No parameters:** Returns all upcoming events
- **Start/End times:** Only available for livestream events
- **b2bInd:** Indicates back-to-back artist performances
- **Images:** Not provided through API

---

### 2. Nearby Events API

**Endpoint:** `/events`
**Method:** `GET`
**Description:** Locates events within proximity parameters

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `latitude` | float | Latitude coordinate |
| `longitude` | float | Longitude coordinate |
| `radius` | integer | Search radius (miles or km) |
| `startDate` | date | Filter events starting from this date |
| `endDate` | date | Filter events ending before this date |

#### Response Format
Same as Event Search API

---

### 3. Locations API

**Endpoint:** `/locations`
**Method:** `GET`
**Description:** Returns location data for cities/regions with EDM events

#### Response Format

```json
{
  "success": true,
  "message": "Success message",
  "data": [
    {
      "id": "location_id",
      "name": "City Name",
      "state": "State/Province",
      "country": "Country",
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  ]
}
```

---

## Data Models

### Event Object
```typescript
interface Event {
  id: string;
  link: string;
  name: string;
  ages: string;
  venue: Venue;
  artists: Artist[];
  date: string; // ISO date format
  startTime?: string; // HH:MM:SS (livestreams only)
  endTime?: string; // HH:MM:SS (livestreams only)
  festivalInd?: boolean;
  livestreamInd?: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}
```

### Artist Object
```typescript
interface Artist {
  id: string;
  name: string;
  b2bInd: boolean; // Back-to-back indicator
}
```

### Venue Object
```typescript
interface Venue {
  id: string;
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
}
```

### Location Object
```typescript
interface Location {
  id: string;
  name: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}
```

---

## Integration Strategy for Metricify

### 1. Artist Matching Algorithm
```
User's Spotify Top Artists → EDMTrain Artist IDs
- Fetch user's top 50 artists from Spotify
- Cross-reference with EDMTrain artist database
- Generate artistIds parameter for event search
```

### 2. Festival Discovery Flow
```
1. GET /events?artistIds={matched_artists}&festivalInd=true
2. Filter by date range (next 3-12 months)
3. Group events by festival name
4. Calculate interest score per festival based on artist matches
```

### 3. Personalized Recommendations
```
Interest Level Calculation:
- High: 5+ matched artists
- Medium: 2-4 matched artists
- Low: 1 matched artist

Genre Matching:
- Fetch user's top genres from Spotify
- Filter festivals by electronic sub-genres
- Prioritize genre alignment
```

### 4. Caching Strategy
```
- Cache festival lineups: 24 hours
- Cache location data: 7 days
- Cache artist matches: 1 hour
- Invalidate on user Spotify data refresh
```

### 5. Error Handling
```
- Implement exponential backoff for rate limiting
- Fallback to cached data on API failures
- Log all API errors for monitoring
```

---

## API Limitations

1. **No Image Data:** Festival/artist images not provided
2. **Rate Limits:** Undocumented - implement conservative limits
3. **Time Precision:** Start/end times only for livestreams
4. **Real-time Updates:** Unknown update frequency for lineups

---

## Recommended API Wrapper Structure

```typescript
class EDMTrainAPI {
  private apiKey: string;
  private baseURL: string = 'https://edmtrain.com/api';

  async searchEvents(params: EventSearchParams): Promise<Event[]>
  async getNearbyEvents(lat: number, lon: number, radius: number): Promise<Event[]>
  async getLocations(): Promise<Location[]>
  async getEventsByArtists(artistIds: string[]): Promise<Event[]>
  async getFestivals(params: FestivalSearchParams): Promise<Event[]>
}
```

---

## Next Steps for Implementation

1. **API Key Setup:** Apply for EDMTrain API key
2. **Service Layer:** Create `edmtrain.service.ts` in backend
3. **Artist Matching:** Build Spotify → EDMTrain artist mapping
4. **Database Schema:** Extend to store festival/event data
5. **Sync Job:** Scheduled task to refresh festival lineups
6. **UI Components:** Festival cards, artist match indicators

---

**Last Updated:** 2025-11-23
**Branch:** v1.0.1
