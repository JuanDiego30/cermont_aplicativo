/**
 * API Client — Fetch wrapper with auto-refresh and type safety.
 *
 * Implements:
 * - Bearer Token handling
 * - Refresh Token flow (automatic retry on 401)
 * - Error normalization (ApiError)
 * - Request metrics logging
 *
 * Retry is delegated to TanStack Query (browser) or caller (server).
 * DOC-05 §8.1 compliance.
 */

import { useAuthStore } from "@/_shared/store/auth.store";
import { logNetworkError, logRequestMetrics } from "../monitoring/request-logger";
import { generateRequestId } from "../utils/common";

// ─── Constants ──────────────────────────────────────────────────────────────

const API_ROOT = "/api/backend";

// ─── Types ──────────────────────────────────────────────────────────────────

export class ApiError extends Error {
	constructor(
		public status: number,
		public code: string,
		message: string,
		public details?: unknown,
	) {
		super(message);
		this.name = "ApiError";
	}
}

interface RequestState {
	method: string;
	normalizedPath: string;
	requestUrl: string;
	requestId: string;
	startedAt: number;
}

interface RequestOptions extends Omit<RequestInit, "headers"> {
	headers: Record<string, string>;
}

// ─── Helper Functions ───────────────────────────────────────────────────────

type ApiErrorDetails = Record<string, string | number | boolean | null>;

interface ApiErrorPayload {
	code?: string;
	message?: string;
	details?: ApiErrorDetails;
}

interface ApiErrorResponse {
	code?: string;
	message?: string;
	details?: ApiErrorDetails;
	error?: ApiErrorPayload | string | null;
}

function getRequestHeaders(
	customHeaders?: HeadersInit,
	body?: BodyInit | null,
): Record<string, string> {
	const headers: Record<string, string> = {
		Accept: "application/json",
	};

	if (body && !(body instanceof FormData)) {
		headers["Content-Type"] = "application/json";
	}

	const { accessToken } = useAuthStore.getState();
	if (accessToken) {
		headers.Authorization = `Bearer ${accessToken}`;
	}

	if (customHeaders) {
		const entries =
			customHeaders instanceof Headers
				? Array.from(customHeaders.entries())
				: Object.entries(customHeaders);

		for (const [key, value] of entries) {
			headers[key] = value;
		}
	}

	return headers;
}

function getErrorCode(body: ApiErrorResponse | null): string {
	if (typeof body?.error === "object" && body.error !== null && body.error.code) {
		return body.error.code;
	}

	if (body?.code) {
		return body.code;
	}

	return "UNKNOWN_ERROR";
}

function getErrorMessage(body: ApiErrorResponse | null, fallbackMessage: string): string {
	if (typeof body?.error === "object" && body.error !== null && body.error.message) {
		return body.error.message;
	}

	if (body?.message) {
		return body.message;
	}

	if (typeof body?.error === "string" && body.error) {
		return body.error;
	}

	return fallbackMessage;
}

function getErrorDetails(body: ApiErrorResponse | null): ApiErrorDetails | undefined {
	if (typeof body?.error === "object" && body.error !== null && body.error.details) {
		return body.error.details;
	}

	return body?.details;
}

async function parseJsonBody(response: Response): Promise<ApiErrorResponse | null> {
	try {
		return (await response.json()) as ApiErrorResponse;
	} catch {
		return null;
	}
}

function assertResponseOk(
	response: Response,
	body: ApiErrorResponse | null,
	fallbackMessage: string,
): never {
	const code = getErrorCode(body);
	const message = getErrorMessage(body, fallbackMessage);
	const details = getErrorDetails(body);

	throw new ApiError(response.status, code, message, details);
}

function assertRetryResponseOk(response: Response, body: ApiErrorResponse | null): void {
	if (!response.ok) {
		assertResponseOk(response, body, "Request failed after token refresh");
	}
}

// ─── Token Refresh Coordination ──────────────────────────────────────────────

let refreshPromise: Promise<string | null> | null = null;

async function waitForRefresh(): Promise<string> {
	if (refreshPromise) {
		const token = await refreshPromise;
		if (token) {
			return token;
		}
		throw new ApiError(401, "AUTH_REQUIRED", "Session expired. Please login again.");
	}

	refreshPromise = performRefresh();
	try {
		const token = await refreshPromise;
		if (token) {
			return token;
		}
		throw new ApiError(401, "AUTH_REQUIRED", "Session expired. Please login again.");
	} finally {
		refreshPromise = null;
	}
}

async function performRefresh(): Promise<string | null> {
	try {
		const response = await fetch(`${API_ROOT}/auth/refresh`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include", // Important for HttpOnly cookies
		});

		if (!response.ok) {
			useAuthStore.getState().clearAuth();
			return null;
		}

		const { data } = await response.json();
		const newToken = data?.accessToken;

		if (newToken) {
			// Refresh only returns new access token, keep existing user
			useAuthStore.getState().setAccessToken(newToken);
			return newToken;
		}

		useAuthStore.getState().clearAuth();
		return null;
	} catch {
		useAuthStore.getState().clearAuth();
		return null;
	}
}

// ─── Core Request Engine ─────────────────────────────────────────────────────

async function parseSuccessfulResponse<T>(
	response: Response,
	state: RequestState,
	attempt: number,
): Promise<T> {
	logRequestMetrics({
		method: state.method,
		url: state.normalizedPath,
		status: response.status,
		requestId: response.headers.get("X-Request-Id") ?? state.requestId,
		durationMs: Date.now() - state.startedAt,
		attempt: attempt + 1,
	});

	if (response.status === 204) {
		return null as T;
	}

	return (await response.json()) as T;
}

async function retryWithFreshToken<T>(
	state: RequestState,
	requestOptions: RequestOptions,
): Promise<T> {
	const token = await waitForRefresh();
	const retryResponse = await executeFetch(state, {
		...requestOptions,
		headers: {
			...requestOptions.headers,
			Authorization: `Bearer ${token}`,
		},
	});

	const retryBody = await parseJsonBody(retryResponse);

	if (retryResponse.ok) {
		return parseSuccessfulResponse<T>(retryResponse, state, 1);
	}

	assertRetryResponseOk(retryResponse, retryBody);

	// This point is never reached because assertRetryResponseOk throws on !ok
	throw new Error("Impossible path in retryWithFreshToken");
}

async function handleResponse<T>(
	response: Response,
	state: RequestState,
	requestOptions: RequestOptions,
): Promise<T> {
	if (response.ok) {
		return parseSuccessfulResponse<T>(response, state, 1);
	}

	const body = await parseJsonBody(response);

	if (response.status === 401 && getErrorCode(body) === "TOKEN_EXPIRED") {
		return retryWithFreshToken<T>(state, requestOptions);
	}

	assertResponseOk(response, body, response.statusText);
	throw new Error("Impossible path in handleResponse");
}

async function executeFetch(state: RequestState, options: RequestOptions): Promise<Response> {
	return fetch(state.requestUrl, {
		...options,
		headers: { ...options.headers, "X-Request-Id": state.requestId },
	});
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
	const method = (options.method ?? "GET").toUpperCase();
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	const requestUrl = `${API_ROOT}${normalizedPath}`;
	const requestId = generateRequestId();
	const startedAt = Date.now();

	const state: RequestState = {
		method,
		normalizedPath,
		requestUrl,
		requestId,
		startedAt,
	};

	const requestOptions: RequestOptions = {
		method,
		headers: getRequestHeaders(options.headers, options.body),
		body: options.body,
		cache: "no-store",
		credentials: "include",
	};

	try {
		const response = await executeFetch(state, requestOptions);
		return await handleResponse<T>(response, state, requestOptions);
	} catch (error) {
		if (error instanceof ApiError) {
			throw error;
		}
		logNetworkError(method, normalizedPath, requestId, Date.now() - startedAt, 1);
		throw error;
	}
}

export const apiClient = {
	get: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: "GET" }),
	post: <T>(path: string, body?: unknown, init?: RequestInit) =>
		request<T>(path, {
			...init,
			method: "POST",
			body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
		}),
	put: <T>(path: string, body?: unknown, init?: RequestInit) =>
		request<T>(path, {
			...init,
			method: "PUT",
			body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
		}),
	patch: <T>(path: string, body?: unknown, init?: RequestInit) =>
		request<T>(path, {
			...init,
			method: "PATCH",
			body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
		}),
	delete: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: "DELETE" }),
};

export function toApiUrl(path: string): string {
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	return `${API_ROOT}${normalizedPath}`;
}
