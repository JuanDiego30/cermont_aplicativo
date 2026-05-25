/**
 * Safely reads a search parameter value from URLSearchParams or ReadonlyURLSearchParams.
 * Uses .get() directly to avoid "Illegal invocation" errors caused by
 * Next.js's ReadonlyURLSearchParams Proxy losing `this` binding when
 * .toString() is called as a detached method reference.
 */
export function readSearchParam(searchParams: URLSearchParams, key: string): string {
	return searchParams.get(key) ?? "";
}

/**
 * Safely converts URLSearchParams or ReadonlyURLSearchParams to a plain string.
 * Avoids the "Illegal invocation" error by ensuring .toString() is called
 * with the correct `this` binding.
 */
export function searchParamsToString(searchParams: URLSearchParams): string {
	return searchParams.toString();
}

/**
 * Creates a plain URLSearchParams from ReadonlyURLSearchParams safely.
 * Uses .forEach() to avoid calling .toString() on a Proxy object.
 */
export function cloneSearchParams(source: URLSearchParams): URLSearchParams {
	const params = new URLSearchParams();
	source.forEach((value: string, key: string) => {
		params.append(key, value);
	});
	return params;
}
