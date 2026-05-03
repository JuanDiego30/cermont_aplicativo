import { logger } from "./logger";

/**
 * Log request metrics
 */
export function logRequestMetrics(data: {
	method: string;
	url: string;
	status: number;
	requestId: string;
	durationMs: number;
	attempt: number;
}) {
	logger.info("API Request", data);
}

/**
 * Log request failure
 */
export function logRequestFailure(
	method: string,
	path: string,
	requestId: string,
	durationMs: number,
	attempt: number,
) {
	logger.error("API Request Failed", {
		method,
		path,
		requestId,
		durationMs,
		attempt,
	});
}

/**
 * Log network error (no response)
 */
export function logNetworkError(
	method: string,
	path: string,
	requestId: string,
	durationMs: number,
	attempt: number,
) {
	logger.error("API Network Error", {
		method,
		path,
		requestId,
		durationMs,
		attempt,
	});
}
