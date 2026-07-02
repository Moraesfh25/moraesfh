import { Match, APIFootballFixture, APIFootballResponse } from "../types";


export class APIFootballClient {
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  // Helper to fetch with retry and caching
  static async request<T>(endpoint: string, params: Record<string, string> = {}): Promise<T[]> {
    const query = new URLSearchParams(params).toString();
    const url = `/api/football?endpoint=${encodeURIComponent(endpoint)}&${query}`;
    const cacheKey = `apifootball_cache_${endpoint}_${query}`;

    // 1. Try Cache
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < this.CACHE_DURATION) {
          console.log(`[API-Football] Cache Hit for ${endpoint}`);
          return data as T[];
        }
      }
    } catch (e) {
      console.warn("Cache read failed:", e);
    }

    // 2. Fetch with Retries
    let attempts = 3;
    let delay = 1000;

    while (attempts > 0) {
      try {
        console.log(`[API-Football] Fetching ${endpoint} (Attempts left: ${attempts})...`);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        
        const data: APIFootballResponse<T> = await response.json();
        
        // Check API-Football specific errors
        if (data.errors && !Array.isArray(data.errors) && Object.keys(data.errors).length > 0) {
          throw new Error(`API Error: ${JSON.stringify(data.errors)}`);
        }

        const results = data.response || [];

        // Save Cache
        try {
          localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: results }));
        } catch (e) {
          console.warn("Cache write failed:", e);
        }

        return results;
      } catch (err) {
        attempts--;
        if (attempts === 0) {
          console.error(`[API-Football] Request to ${endpoint} failed after all retries:`, err);
          throw err;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // exponential backoff
      }
    }

    return [];
  }
}
