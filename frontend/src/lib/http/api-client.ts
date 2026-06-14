// src/lib/http/api-client.ts
// ÚNICO cliente HTTP del frontend — todos los módulos usan este

import { isProduction } from "@cermont/config";
import { isPresent } from "@cermont/shared-types";
import { useAuthStore } from "@/store/auth.store";
import { useOfflineStore } from "@/store/offline.store";
import {
	API_ROOT,
	ApiError,
	type ApiErrorDetail,
	BASE_RETRY_DELAY_MS,
	DEFAULT_RETRY_METHODS,
	DEFAULT_RETRY_STATUSES,
	type ErrorBody,
	MAX_RETRIES,
	type PendingRequest,
} from "./api-client-constants";

export { ApiError } from "./api-client-constants";

let isRefreshing = false;
let pendingRequests: PendingRequest[] = [];
const OFFLINE_LIKE_ERROR_CODES = new Set([
	"BACKEND_UNAVAILABLE",
	"OFFLINE",
	"SERVICE_UNAVAILABLE",
	"NETWORK_ERROR",
]);

interface RequestContext {
	canRetry: boolean;
	method: string;
	normalizedPath: string;
	requestId: string;
	requestUrl: string;
	startedAt: number;
	isAuthRequest: boolean;
}

function generateRequestId(): string {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return crypto.randomUUID();
	}
	return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function logApiRequest(message: string, metadata: Record<string, unknown>): void {
	if (isProduction()) {
		console.info(
			JSON.stringify({ level: "info", source: "frontend-api-client", message, ...metadata }),
		);
		return;
	}
	console.info(`[frontend-api-client] ${message}`, metadata);
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildAuthHeaders(): HeadersInit {
	const tokenStatus = useAuthStore.getState().accessToken;

	if (!isPresent(tokenStatus)) {
		return {};
	}

	return { Authorization: `Bearer ${tokenStatus.value}` };
}

function isFormDataBody(body: RequestInit["body"]): boolean {
	return typeof FormData !== "undefined" && body instanceof FormData;
}

async function parseJsonBody(response: Response): Promise<unknown> {
	return response.json().catch(() => ({}));
}

function getErrorMessage(body: unknown, fallback: string): string {
	const errorBody = body as ErrorBody;
	const nestedError = errorBody?.error;
	if (typeof nestedError === "string") {
		return nestedError;
	}
	if (nestedError && typeof nestedError === "object" && typeof nestedError.message === "string") {
		return nestedError.message;
	}
	if (typeof errorBody?.message === "string") {
		return errorBody.message;
	}
	return fallback;
}

function getErrorCode(body: unknown): string | undefined {
	const errorBody = body as ErrorBody;
	const nestedError = errorBody?.error;
	if (typeof errorBody?.code === "string") {
		return errorBody.code;
	}
	if (nestedError && typeof nestedError === "object" && typeof nestedError.code === "string") {
		return nestedError.code;
	}
	return undefined;
}

function getErrorDetails(body: unknown): ApiErrorDetail[] {
	const errorBody = body as ErrorBody;
	const nestedError = errorBody?.error;
	if (nestedError && typeof nestedError === "object" && Array.isArray(nestedError.details)) {
		return nestedError.details;
	}
	if (Array.isArray(errorBody?.details)) {
		return errorBody.details;
	}
	return [];
}

function isOfflineLikeCode(code: string | undefined): boolean {
	return typeof code === "string" && OFFLINE_LIKE_ERROR_CODES.has(code);
}

function isBrowserOffline(): boolean {
	return !useOfflineStore.getState().isOnline;
}

function isUserAuthenticatedInStorage(): boolean {
	if (typeof window === "undefined") {
		return false;
	}
	try {
		const raw = window.localStorage.getItem("cermont-auth");
		if (!raw) {
			return false;
		}
		const parsed = JSON.parse(raw);
		const userStatus = parsed?.state?.user;
		return (
			userStatus?.status === "present" ||
			(userStatus?.id && userStatus?.role) ||
			parsed?.state?.isAuthenticated === true
		);
	} catch {
		return false;
	}
}

export function isOfflineLikeError(error: Error): boolean {
	if (error instanceof ApiError) {
		return (
			isOfflineLikeCode(error.code) || (error.status === 503 && error.code !== "TOKEN_EXPIRED")
		);
	}

	if (error instanceof TypeError) {
		const message = error.message.toLowerCase();
		return (
			message.includes("failed to fetch") ||
			message.includes("networkerror") ||
			message.includes("load failed")
		);
	}

	return error.name === "AbortError";
}

function rejectPendingRequests(error: unknown): void {
	for (const pending of pendingRequests) {
		pending.reject(error);
	}
	pendingRequests = [];
}

function resolvePendingRequests(token: string): void {
	for (const pending of pendingRequests) {
		pending.resolve(token);
	}
	pendingRequests = [];
}

async function waitForRefresh(): Promise<string> {
	if (isRefreshing) {
		return new Promise<string>((resolve, reject) => {
			pendingRequests.push({ resolve, reject });
		});
	}
	isRefreshing = true;
	try {
		const token = await refreshAccessToken();
		resolvePendingRequests(token);
		return token;
	} catch (error) {
		rejectPendingRequests(error);
		throw error;
	} finally {
		isRefreshing = false;
	}
}

async function refreshAccessToken(): Promise<string> {
	const { clearAuth, setAccessToken } = useAuthStore.getState();
	// CRITICAL: Use the dedicated /api/auth/refresh route handler (not the generic
	// /api/backend/* proxy) so the refresh request benefits from:
	//   - Retry logic for transient backend failures (restart / nodemon)
	//   - Explicit no-cache / no-store headers so the SW never intercepts it
	//   - Proper Set-Cookie forwarding (rotated refreshToken cookie)
	const response = await fetch("/api/auth/refresh", {
		method: "POST",
		headers: { "Content-Type": "application/json", "X-Skip-SW": "1" },
		cache: "no-store",
		credentials: "include",
	});
	const body = await parseJsonBody(response);
	if (!response.ok) {
		clearAuth();
		throw new ApiError(
			response.status,
			getErrorMessage(body, response.statusText || "Session refresh failed"),
			getErrorCode(body),
			getErrorDetails(body),
		);
	}
	const responseData = body as { data?: { accessToken?: string }; accessToken?: string };
	const accessToken = responseData.data?.accessToken ?? responseData.accessToken;
	if (typeof accessToken !== "string" || !accessToken) {
		clearAuth();
		throw new ApiError(500, "Invalid refresh response");
	}
	setAccessToken(accessToken);
	return accessToken;
}

// Auth endpoints that have a DEDICATED Next.js Route Handler under
// frontend/src/app/api/auth/<name>/route.ts. ONLY these may be routed to
// /api/auth/* — any other /auth/* path (e.g. /auth/me, /auth/logout) has no
// dedicated handler and would 404; those must go through the generic proxy.
const DEDICATED_AUTH_ROUTES = new Set([
	"/auth/login",
	"/auth/refresh",
	"/auth/forgot-password",
	"/auth/register-client",
]);

// Credential endpoints where a 401 means "bad credentials / dead session",
// NOT "expired access token" — triggering a token refresh on these would
// mask the real error (e.g. wrong password on login).
const CREDENTIAL_AUTH_ROUTES = new Set([
	"/auth/login",
	"/auth/refresh",
	"/auth/logout",
	"/auth/forgot-password",
	"/auth/reset-password",
	"/auth/register-client",
]);

function createRequestContext(path: string, options: RequestInit): RequestContext {
	const method = (options.method ?? "GET").toUpperCase();
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	const isAuthRequest = CREDENTIAL_AUTH_ROUTES.has(normalizedPath);
	return {
		canRetry: DEFAULT_RETRY_METHODS.has(method),
		method,
		normalizedPath,
		requestId: generateRequestId(),
		// Dedicated handlers (retry logic, no-store headers, Set-Cookie
		// forwarding) exist only for the routes in DEDICATED_AUTH_ROUTES.
		// Everything else — including /auth/me — uses the generic proxy,
		// which also has retry logic for backend restarts.
		requestUrl: DEDICATED_AUTH_ROUTES.has(normalizedPath)
			? `/api${normalizedPath}`
			: `${API_ROOT}${normalizedPath}`,
		startedAt: Date.now(),
		isAuthRequest,
	};
}

function createRequestInit(
	options: RequestInit,
	requestId: string,
	authorization?: string,
	isAuthRequest = false,
): RequestInit {
	return {
		...options,
		headers: {
			...(isFormDataBody(options.body) ? {} : { "Content-Type": "application/json" }),
			...buildAuthHeaders(),
			...(authorization ? { Authorization: authorization } : {}),
			"X-Request-Id": requestId,
			...(isAuthRequest ? { "X-Skip-SW": "1", "Cache-Control": "no-cache, no-store" } : {}),
		},
		cache: "no-store",
		credentials: "include",
	};
}

async function readSuccessfulResponse<T>(response: Response): Promise<T> {
	if (response.status === 204) {
		return null as T;
	}
	return (await response.json()) as T;
}

function logCompletedRequest(
	context: RequestContext,
	status: number,
	requestId: string,
	attempt: number,
): void {
	logApiRequest("Request completed", {
		method: context.method,
		url: context.normalizedPath,
		status,
		requestId,
		durationMs: Date.now() - context.startedAt,
		attempt,
	});
}

function shouldRetryResponse(
	context: RequestContext,
	status: number,
	attempt: number,
	code: string | undefined,
): boolean {
	if (isOfflineLikeCode(code)) {
		return false;
	}

	return context.canRetry && DEFAULT_RETRY_STATUSES.has(status) && attempt < MAX_RETRIES;
}

async function retryAfterTokenRefresh<T>(
	context: RequestContext,
	options: RequestInit,
): Promise<T> {
	const token = await waitForRefresh();
	const retryResponse = await fetch(
		context.requestUrl,
		createRequestInit(options, context.requestId, `Bearer ${token}`, context.isAuthRequest),
	);

	if (retryResponse.ok) {
		logApiRequest("Request completed after refresh", {
			method: context.method,
			url: context.normalizedPath,
			status: retryResponse.status,
			requestId: context.requestId,
			durationMs: Date.now() - context.startedAt,
		});
		return readSuccessfulResponse<T>(retryResponse);
	}

	const retryBody = await parseJsonBody(retryResponse);
	throw new ApiError(
		retryResponse.status,
		getErrorMessage(retryBody, retryResponse.statusText),
		getErrorCode(retryBody),
		getErrorDetails(retryBody),
	);
}

async function handleResponse<T>(
	context: RequestContext,
	options: RequestInit,
	response: Response,
	attempt: number,
): Promise<T | "retry"> {
	const responseRequestId = response.headers.get("X-Request-Id") ?? context.requestId;

	if (response.ok) {
		logCompletedRequest(context, response.status, responseRequestId, attempt + 1);
		return readSuccessfulResponse<T>(response);
	}

	const body = await parseJsonBody(response);
	const code = getErrorCode(body);

	if (response.status === 401) {
		// CRITICAL: Never trigger token refresh on auth endpoints themselves.
		// A 401 from /auth/login means wrong credentials, not an expired token.
		// Triggering refresh here would corrupt the error with a stale-token
		// failure and confuse the user with an unhelpful error message.
		if (!context.isAuthRequest) {
			// Trigger refresh on any 401 when the user is authenticated.
			// The backend returns "UNAUTHORIZED" for missing/invalid tokens and
			// "TOKEN_EXPIRED" for expired tokens. Both cases require a refresh
			// via the httpOnly refresh-token cookie. Without this, the first
			// request after a page reload (when the in-memory access token is
			// gone but isAuthenticated is still true from the persist layer)
			// would 401-storm the backend because 401 is not in the retry set
			// but TanStack Query would still retry the query.
			if (
				code === "TOKEN_EXPIRED" ||
				useAuthStore.getState().isAuthenticated ||
				isUserAuthenticatedInStorage()
			) {
				return retryAfterTokenRefresh<T>(context, options);
			}
		}
	}

	if (shouldRetryResponse(context, response.status, attempt, code)) {
		await sleep(BASE_RETRY_DELAY_MS * (attempt + 1));
		return "retry";
	}

	logApiRequest("Request failed", {
		method: context.method,
		url: context.normalizedPath,
		status: response.status,
		requestId: responseRequestId,
		durationMs: Date.now() - context.startedAt,
		attempt: attempt + 1,
	});
	throw new ApiError(
		response.status,
		getErrorMessage(body, response.statusText),
		code,
		getErrorDetails(body),
	);
}

async function handleNetworkError(
	context: RequestContext,
	error: unknown,
	attempt: number,
): Promise<void> {
	if (error instanceof ApiError) {
		throw error;
	}

	if (isBrowserOffline()) {
		throw new ApiError(503, "Sin conexión. Se mostrarán datos locales si existen.", "OFFLINE");
	}

	logApiRequest("Request network error", {
		method: context.method,
		url: context.normalizedPath,
		requestId: context.requestId,
		durationMs: Date.now() - context.startedAt,
		attempt: attempt + 1,
	});
	if (!context.canRetry || attempt >= MAX_RETRIES) {
		const message =
			error instanceof Error
				? error.message
				: "El backend no está disponible. Se mostrarán datos locales si existen.";
		throw new ApiError(503, message, "BACKEND_UNAVAILABLE");
	}
	await sleep(BASE_RETRY_DELAY_MS * (attempt + 1));
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
	const context = createRequestContext(path, options);

	if (!context.isAuthRequest) {
		const userStatus = useAuthStore.getState().user;
		const tokenStatus = useAuthStore.getState().accessToken;
		if (!isPresent(tokenStatus) && (isPresent(userStatus) || isUserAuthenticatedInStorage())) {
			try {
				await waitForRefresh();
			} catch (error) {
				logApiRequest("Pre-flight refresh failed", {
					method: context.method,
					url: context.normalizedPath,
					requestId: context.requestId,
					error: error instanceof Error ? error.message : String(error),
				});
				// Continue to let the request execute (it will likely fail with 401 and handle correctly)
			}
		}
	}

	// Retry loop: each iteration re-attempts the same request after backoff.
	// Sequential by definition — not a candidate for Promise.all.
	for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
		try {
			const response = await fetch(
				context.requestUrl,
				createRequestInit(options, context.requestId, undefined, context.isAuthRequest),
			);
			const result = await handleResponse<T>(context, options, response, attempt);
			if (result !== "retry") {
				return result;
			}
		} catch (error) {
			await handleNetworkError(context, error, attempt);
		}
	}
	logApiRequest("Request exhausted retries", {
		method: context.method,
		url: context.normalizedPath,
		requestId: context.requestId,
		durationMs: Date.now() - context.startedAt,
		attempts: MAX_RETRIES + 1,
	});
	throw new ApiError(
		503,
		"El servicio no está disponible. Por favor, inténtalo de nuevo en unos minutos.",
		"SERVICE_UNAVAILABLE",
	);
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
	refresh: () => waitForRefresh(),
};

export function toApiUrl(path: string): string {
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	return `${API_ROOT}${normalizedPath}`;
}
