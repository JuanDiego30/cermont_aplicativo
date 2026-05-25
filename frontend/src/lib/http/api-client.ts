// src/lib/http/api-client.ts
// ÚNICO cliente HTTP del frontend — todos los módulos usan este

import { isProduction } from "@cermont/config";
import { useAuthStore } from "@/store/auth.store";
import {
	API_ROOT,
	ApiError,
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

interface RequestContext {
	canRetry: boolean;
	method: string;
	normalizedPath: string;
	requestId: string;
	requestUrl: string;
	startedAt: number;
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
	const token = useAuthStore.getState().accessToken;
	return token ? { Authorization: `Bearer ${token}` } : {};
}

function getRequestHeaders(
	headers: HeadersInit | undefined,
	body: RequestInit["body"],
): HeadersInit {
	const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
	return {
		...(isFormData ? {} : { "Content-Type": "application/json" }),
		...buildAuthHeaders(),
		...headers,
	};
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
	const response = await fetch(`${API_ROOT}/auth/refresh`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
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

function createRequestContext(path: string, options: RequestInit): RequestContext {
	const method = (options.method ?? "GET").toUpperCase();
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	return {
		canRetry: DEFAULT_RETRY_METHODS.has(method),
		method,
		normalizedPath,
		requestId: generateRequestId(),
		requestUrl: `${API_ROOT}${normalizedPath}`,
		startedAt: Date.now(),
	};
}

function createRequestInit(
	options: RequestInit,
	requestId: string,
	authorization?: string,
): RequestInit {
	return {
		...options,
		headers: {
			...getRequestHeaders(options.headers, options.body),
			...(authorization ? { Authorization: authorization } : {}),
			"X-Request-Id": requestId,
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

function shouldRetryResponse(context: RequestContext, status: number, attempt: number): boolean {
	return context.canRetry && DEFAULT_RETRY_STATUSES.has(status) && attempt < MAX_RETRIES;
}

async function retryAfterTokenRefresh<T>(
	context: RequestContext,
	options: RequestInit,
): Promise<T> {
	const token = await waitForRefresh();
	const retryResponse = await fetch(
		context.requestUrl,
		createRequestInit(options, context.requestId, `Bearer ${token}`),
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

	if (response.status === 401 && code === "TOKEN_EXPIRED") {
		return retryAfterTokenRefresh<T>(context, options);
	}

	if (shouldRetryResponse(context, response.status, attempt)) {
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
	throw new ApiError(response.status, getErrorMessage(body, response.statusText), code);
}

async function handleNetworkError(
	context: RequestContext,
	error: unknown,
	attempt: number,
): Promise<void> {
	if (error instanceof ApiError) {
		throw error;
	}
	logApiRequest("Request network error", {
		method: context.method,
		url: context.normalizedPath,
		requestId: context.requestId,
		durationMs: Date.now() - context.startedAt,
		attempt: attempt + 1,
	});
	if (!context.canRetry || attempt >= MAX_RETRIES) {
		throw error;
	}
	await sleep(BASE_RETRY_DELAY_MS * (attempt + 1));
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
	const context = createRequestContext(path, options);

	for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
		try {
			const response = await fetch(
				context.requestUrl,
				createRequestInit(options, context.requestId),
			);
			const result = await handleResponse<T>(context, options, response, attempt);
			if (result !== "retry") {
				return result;
			}
		} catch (error) {
			await handleNetworkError(context, error, attempt);
		}
	}
	throw new Error("Request failed after retry attempts.");
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
