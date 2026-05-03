/**
 * Query Configuration — Centralized staleTime and cache policies
 *
 * All TanStack Query hooks should import from here to keep
 * stale/refetch behavior consistent across modules.
 */

export const CACHE_CONFIG = {
	/** 30s — frequently changing data (costs, live counters) */
	REALTIME: 30_000,
	/** 1 min — paginated lists */
	LIST: 60_000,
	/** 2 min — individual record detail */
	DETAIL: 120_000,
	/** 5 min — KPIs, analytics, aggregated data */
	ANALYTICS: 300_000,
	/** Never stale — static catalogs (roles, permissions) */
	STATIC: Infinity,
} as const;

export const STALE_TIMES = CACHE_CONFIG;
