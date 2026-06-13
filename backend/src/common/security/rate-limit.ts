interface RateLimitRequestPath {
	path: string;
}

const AUTH_RATE_LIMITED_PATHS = new Set(["/login", "/forgot-password", "/reset-password"]);

export function shouldSkipGlobalRateLimit(request: RateLimitRequestPath): boolean {
	return (
		request.path.startsWith("/api/health") ||
		request.path.startsWith("/health") ||
		request.path.startsWith("/api/auth/") ||
		request.path.startsWith("/uploads/")
	);
}

export function shouldSkipAuthRateLimit(request: RateLimitRequestPath): boolean {
	return !AUTH_RATE_LIMITED_PATHS.has(request.path);
}
