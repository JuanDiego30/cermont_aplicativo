/**
 * Safe pagination utilities for consistent param handling across the app.
 * Prevents NaN / undefined / empty-string leaks to API calls.
 */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parse a raw value as a positive integer. Returns fallback on NaN, zero, or negative.
 */
function parsePositiveInteger(value: string | number | null | undefined, fallback: number): number {
	if (value === null || value === undefined) {
		return fallback;
	}

	const parsed = typeof value === "number" ? value : Number(value);

	if (!Number.isFinite(parsed) || parsed < 1) {
		return fallback;
	}

	return Math.floor(parsed);
}

/**
 * Normalize page/limit/offset from raw search-param input.
 * Guarantees safe values for API calls.
 */
export function normalizePagination(input: {
	page?: string | number | null;
	limit?: string | number | null;
}) {
	const page = parsePositiveInteger(input.page, DEFAULT_PAGE);
	const rawLimit = parsePositiveInteger(input.limit, DEFAULT_LIMIT);
	const limit = Math.min(rawLimit, MAX_LIMIT);
	const offset = (page - 1) * limit;

	return { page, limit, offset };
}
