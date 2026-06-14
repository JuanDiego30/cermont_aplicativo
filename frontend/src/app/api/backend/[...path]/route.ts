import { env } from "@cermont/config";
import { type NextRequest, NextResponse } from "next/server";
import { clearFileAccessTokenCookie, isSecureRequest } from "@/lib/auth/file-access-cookie";
import { createLogger } from "@/lib/monitoring/logger";

const logger = createLogger("API:backend-proxy");

const REQUEST_HEADER_BLOCKLIST = new Set([
	"accept-encoding",
	"connection",
	"content-length",
	"host",
	"transfer-encoding",
	"x-forwarded-host",
	"x-forwarded-port",
	"x-forwarded-proto",
]);

const RESPONSE_HEADER_BLOCKLIST = new Set([
	"connection",
	"content-encoding",
	"content-length",
	"transfer-encoding",
]);

type RouteContext = {
	params: Promise<{
		path?: string[];
	}>;
};

type ProxyMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";

function resolveBackendBaseUrl(): string {
	// BACKEND_URL es la única fuente de verdad. Sin ella, se usa localhost:4000
	// para desarrollo local y npm run start. Docker Compose inyecta explícitamente
	// BACKEND_URL=http://backend:4000 en el contenedor frontend.
	return (env.BACKEND_URL?.trim() || "http://localhost:4000").replace(/\/+$/, "");
}

async function resolveBackendUrl(request: NextRequest, context: RouteContext): Promise<string> {
	const { path = [] } = await context.params;
	const encodedPath = path.map((segment) => encodeURIComponent(segment)).join("/");
	return `${resolveBackendBaseUrl()}/api/${encodedPath}${request.nextUrl.search}`;
}

function buildRequestHeaders(request: NextRequest): Headers {
	const headers = new Headers();

	for (const [key, value] of request.headers.entries()) {
		if (!REQUEST_HEADER_BLOCKLIST.has(key.toLowerCase())) {
			headers.set(key, value);
		}
	}

	const host = request.headers.get("host");
	if (host) {
		headers.set("X-Forwarded-Host", host);
	}
	headers.set("X-Forwarded-Proto", request.nextUrl.protocol.replace(":", ""));

	return headers;
}

async function readForwardBody(
	request: NextRequest,
	method: ProxyMethod,
): Promise<ArrayBuffer | undefined> {
	if (method === "GET" || method === "HEAD") {
		return;
	}

	const body = await request.arrayBuffer();
	return body.byteLength > 0 ? body : undefined;
}

function buildResponseHeaders(response: Response): Headers {
	const headers = new Headers();

	response.headers.forEach((value, key) => {
		const normalizedKey = key.toLowerCase();
		if (normalizedKey !== "set-cookie" && !RESPONSE_HEADER_BLOCKLIST.has(normalizedKey)) {
			headers.set(key, value);
		}
	});

	const cookies =
		typeof response.headers.getSetCookie === "function"
			? response.headers.getSetCookie()
			: response.headers.get("set-cookie")
				? [response.headers.get("set-cookie") as string]
				: [];

	for (const cookie of cookies) {
		headers.append("Set-Cookie", cookie);
	}

	return headers;
}

function isBackendHealthProbe(request: NextRequest, method: ProxyMethod): boolean {
	return method === "HEAD" && request.nextUrl.pathname === "/api/backend/health";
}

function buildConnectivityFallbackResponse(): NextResponse {
	return new NextResponse(null, {
		status: 204,
		headers: {
			"Cache-Control": "no-store, no-cache, must-revalidate",
			"X-Cermont-Backend-Available": "false",
			"X-Cermont-Connectivity-Fallback": "serwist",
		},
	});
}

const PROXY_MAX_RETRIES = 2;
const PROXY_RETRY_DELAY_MS = 1000;

async function fetchBackend(
	backendUrl: string,
	method: ProxyMethod,
	headers: Headers,
	body: ArrayBuffer | undefined,
	attempt = 1,
): Promise<Response> {
	try {
		const response = await fetch(backendUrl, {
			method,
			headers,
			body,
			cache: "no-store",
			redirect: "manual",
			signal: AbortSignal.timeout(20_000),
		});
		// Retry transient server errors (5xx) but not client errors (4xx).
		if (response.status >= 500 && attempt < PROXY_MAX_RETRIES) {
			await new Promise((r) => setTimeout(r, PROXY_RETRY_DELAY_MS * attempt));
			return fetchBackend(backendUrl, method, headers, body, attempt + 1);
		}
		return response;
	} catch (error) {
		// Network errors (connection refused, timeout) mean the backend is
		// still starting up after a code change / nodemon restart.
		if (attempt < PROXY_MAX_RETRIES) {
			await new Promise((r) => setTimeout(r, PROXY_RETRY_DELAY_MS * attempt));
			return fetchBackend(backendUrl, method, headers, body, attempt + 1);
		}
		throw error;
	}
}

async function forwardBackendRequest(
	request: NextRequest,
	context: RouteContext,
	method: ProxyMethod,
): Promise<NextResponse> {
	const backendUrl = await resolveBackendUrl(request, context);
	const headers = buildRequestHeaders(request);
	const body = await readForwardBody(request, method);
	const response = await fetchBackend(backendUrl, method, headers, body);

	if (isBackendHealthProbe(request, method) && !response.ok) {
		return buildConnectivityFallbackResponse();
	}

	const responseBody = method === "HEAD" ? null : await response.arrayBuffer();
	const nextResponse = new NextResponse(responseBody, {
		status: response.status,
		statusText: response.statusText,
		headers: buildResponseHeaders(response),
	});
	if (method === "POST" && request.nextUrl.pathname === "/api/backend/auth/logout") {
		clearFileAccessTokenCookie(nextResponse, isSecureRequest(request));
	}
	return nextResponse;
}

async function handleProxyRequest(
	request: NextRequest,
	context: RouteContext,
	method: ProxyMethod,
): Promise<NextResponse> {
	try {
		return await forwardBackendRequest(request, context, method);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Backend proxy request failed";
		logger.warn("Backend unavailable through frontend proxy", {
			method,
			path: request.nextUrl.pathname,
			error: message,
		});

		if (isBackendHealthProbe(request, method)) {
			return buildConnectivityFallbackResponse();
		}

		return NextResponse.json(
			{
				ok: false,
				code: "BACKEND_UNAVAILABLE",
				message: "El backend no está disponible. Se mostrarán datos locales si existen.",
			},
			{ status: 503 },
		);
	}
}

export function GET(request: NextRequest, context: RouteContext) {
	return handleProxyRequest(request, context, "GET");
}

export function POST(request: NextRequest, context: RouteContext) {
	return handleProxyRequest(request, context, "POST");
}

export function PUT(request: NextRequest, context: RouteContext) {
	return handleProxyRequest(request, context, "PUT");
}

export function PATCH(request: NextRequest, context: RouteContext) {
	return handleProxyRequest(request, context, "PATCH");
}

export function DELETE(request: NextRequest, context: RouteContext) {
	return handleProxyRequest(request, context, "DELETE");
}

export function HEAD(request: NextRequest, context: RouteContext) {
	return handleProxyRequest(request, context, "HEAD");
}
