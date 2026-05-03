/**
 * Common frontend utilities
 */

/**
 * Generate a unique request ID for tracing
 */
export function generateRequestId(): string {
	return `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Simple sleep helper for retries
 */
export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
