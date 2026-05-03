/**
 * Build a URL with query string from a base path and filters.
 *
 * @example
 * buildQueryString('/orders', { page: 1, status: 'open' })
 * // → '/orders?page=1&status=open'
 */
export function buildQueryString(basePath: string, filters?: Record<string, unknown>): string {
	if (!filters) {
		return basePath;
	}
	const params = new URLSearchParams();
	Object.entries(filters).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			params.set(key, String(value));
		}
	});
	const qs = params.toString();
	return qs ? `${basePath}?${qs}` : basePath;
}
