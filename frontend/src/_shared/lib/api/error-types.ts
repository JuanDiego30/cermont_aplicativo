/**
 * API Error Types and Constants
 */

export const ApiErrorCode = {
	VALIDATION_ERROR: "VALIDATION_ERROR",
	UNAUTHORIZED: "UNAUTHORIZED",
	FORBIDDEN: "FORBIDDEN",
	NOT_FOUND: "NOT_FOUND",
	CONFLICT: "CONFLICT",
	INTERNAL_ERROR: "INTERNAL_ERROR",
	BAD_REQUEST: "BAD_REQUEST",
	RATE_LIMITED: "RATE_LIMITED",
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

export interface ApiErrorResponse {
	error: string;
	code: ApiErrorCode;
	message: string;
	details?: Record<string, unknown>;
	timestamp: string;
	requestId?: string;
}

export interface ApiErrorContext extends Record<string, unknown> {
	requestId?: string;
}
