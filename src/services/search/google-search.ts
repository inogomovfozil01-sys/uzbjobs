import { prisma } from "@/lib/prisma";

export interface GoogleSearchResultItem {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  pagemap?: {
    metatags?: Array<Record<string, string>>;
    jobposting?: Array<Record<string, any>>;
  };
}

export interface GoogleSearchResponse {
  items?: GoogleSearchResultItem[];
  searchInformation?: {
    totalResults?: string;
    searchTime?: number;
  };
  error?: {
    code: number;
    message: string;
  };
}

class GoogleSearchService {
  private apiKey: string;
  private cx: string;
  private cache = new Map<string, { items: GoogleSearchResultItem[]; timestamp: number }>();
  private cacheTtlMs = 60 * 60 * 1000; // 1 hour cache
  private rateLimitWindowMs = 60 * 1000;
  private requestTimestamps: number[] = [];
  private maxRequestsPerMinute = 25; // Safe threshold for free/custom tier

  constructor() {
    this.apiKey = process.env.GOOGLE_SEARCH_API_KEY || "";
    this.cx = process.env.GOOGLE_SEARCH_ENGINE_ID || "";
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0 && this.cx && this.cx.trim().length > 0);
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(
      (ts) => now - ts < this.rateLimitWindowMs
    );

    if (this.requestTimestamps.length >= this.maxRequestsPerMinute) {
      const oldest = this.requestTimestamps[0];
      const waitTime = this.rateLimitWindowMs - (now - oldest) + 500;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    this.requestTimestamps.push(Date.now());
  }

  private normalizeQuery(query: string): string {
    return query.trim().toLowerCase().replace(/\s+/g, " ");
  }

  public async searchJobs(query: string, num: number = 10): Promise<GoogleSearchResultItem[]> {
    const normalized = this.normalizeQuery(query);

    // 1. Check cache
    const cached = this.cache.get(normalized);
    if (cached && Date.now() - cached.timestamp < this.cacheTtlMs) {
      return cached.items;
    }

    if (!this.isConfigured()) {
      // Record search log if DB available
      try {
        await prisma.searchLog.create({
          data: {
            query: normalized,
            resultsCount: 0,
            durationMs: 0,
            status: "NOT_CONFIGURED",
            error: "Google Search API Key or Engine ID not configured",
          },
        });
      } catch {}
      return [];
    }

    const startTime = Date.now();
    const url = new URL("https://www.googleapis.com/customsearch/v1");
    url.searchParams.set("key", this.apiKey);
    url.searchParams.set("cx", this.cx);
    url.searchParams.set("q", normalized);
    url.searchParams.set("num", Math.min(10, Math.max(1, num)).toString());
    url.searchParams.set("lr", "lang_ru|lang_uz|lang_en"); // Uzbekistan multi-language support

    let lastError: any = null;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.enforceRateLimit();

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(url.toString(), {
          signal: controller.signal,
          headers: {
            "Accept": "application/json",
          },
        });
        clearTimeout(timer);

        const durationMs = Date.now() - startTime;

        if (res.status === 429 || res.status >= 500) {
          // Exponential backoff
          const backoff = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }

        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`Google Search API returned ${res.status}: ${errBody}`);
        }

        const data: GoogleSearchResponse = await res.json();
        const items = data.items || [];

        // Save to cache
        this.cache.set(normalized, {
          items,
          timestamp: Date.now(),
        });

        // Record SearchLog
        try {
          await prisma.searchLog.create({
            data: {
              query: normalized,
              resultsCount: items.length,
              durationMs,
              status: "SUCCESS",
            },
          });
        } catch {}

        return items;
      } catch (err: any) {
        lastError = err;
        if (attempt === maxRetries) {
          try {
            await prisma.searchLog.create({
              data: {
                query: normalized,
                resultsCount: 0,
                durationMs: Date.now() - startTime,
                status: "ERROR",
                error: err.message,
              },
            });
          } catch {}
          throw err;
        }
      }
    }

    return [];
  }

  public async searchMultipleQueries(queries: string[]): Promise<Map<string, GoogleSearchResultItem[]>> {
    const results = new Map<string, GoogleSearchResultItem[]>();
    for (const query of queries) {
      try {
        const items = await this.searchJobs(query);
        results.set(query, items);
      } catch (err) {
        console.error(`Error searching query "${query}":`, err);
        results.set(query, []);
      }
    }
    return results;
  }

  public async searchByLocation(location: string): Promise<GoogleSearchResultItem[]> {
    return this.searchJobs(`вакансия работа ${location}`);
  }

  public async searchByCategory(category: string): Promise<GoogleSearchResultItem[]> {
    return this.searchJobs(`вакансия ${category} Узбекистан`);
  }

  public async searchByKeyword(keyword: string): Promise<GoogleSearchResultItem[]> {
    return this.searchJobs(`${keyword} вакансия Ташкент Узбекистан`);
  }
}

export const googleSearchService = new GoogleSearchService();
export default googleSearchService;
