const RETRY_DELAYS_MS = [1_000, 2_000, 4_000, 8_000, 30_000] as const;
export const MAX_RETRY_COUNT = 5;

export function getNextRetryDelay(retryCount: number): number {
	const normalizedRetryCount = Number.isFinite(retryCount)
		? Math.max(1, Math.floor(retryCount))
		: 1;
	const index = Math.min(normalizedRetryCount - 1, RETRY_DELAYS_MS.length - 1);

	return RETRY_DELAYS_MS[index];
}

export function hasExceededMaxRetries(retryCount: number): boolean {
	return retryCount >= MAX_RETRY_COUNT;
}
