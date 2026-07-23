/**
 * Cache Middleware — Simple in-memory cache for GET endpoints
 *
 * SCALABILITY: Reduces repeated DB queries for dashboard endpoints.
 * LRU eviction when cache exceeds 100 entries.
 */

import type { Request, Response, NextFunction } from "express";

// biome-ignore lint/suspicious/noExplicitAny: cache stores any JSON-serializable body
const cache = new Map<string, { data: any; expiresAt: number }>();

export function cacheMiddleware(durationMs = 30_000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.method !== "GET") {
      next();
      return;
    }

    const key = req.originalUrl;
    const cached = cache.get(key);

    if (cached && cached.expiresAt > Date.now()) {
      res.json(cached.data);
      return;
    }

    const originalJson = res.json.bind(res);
    // biome-ignore lint/suspicious/noExplicitAny: override must accept any JSON body
    res.json = (body: any) => {
      cache.set(key, { data: body, expiresAt: Date.now() + durationMs });

      if (cache.size > 100) {
        const firstKey = cache.keys().next().value;
        if (firstKey) { cache.delete(firstKey); }
      }

      return originalJson(body);
    };
    next();
  };
}
