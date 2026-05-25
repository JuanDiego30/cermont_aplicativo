/**
 * API Client — Constants and Types
 */

export class ApiError extends Error {
	constructor(
		public status: number,
		public message: string,
		public code?: string,
	) {
		super(message);
		this.name = "ApiError";
	}
}

export const DEFAULT_RETRY_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);
export const DEFAULT_RETRY_METHODS = new Set(["GET", "HEAD"]);
export const MAX_RETRIES = 2;
export const BASE_RETRY_DELAY_MS = 350;

// Browser requests go via Next.js proxy at /api/backend/*
// Next.js rewrites /api/backend/:path* → backend /api/:path*
// apiClient adds API_ROOT prefix, so modules call relative paths: /auth/login, /users, etc.
export const API_ROOT = "/api/backend";

export type ErrorBody = {
	error?:
		| {
				code?: string;
				message?: string;
		  }
		| string;
	code?: string;
	message?: string;
};

export type PendingRequest = {
	resolve: (token: string) => void;
	reject: (error: unknown) => void;
};
