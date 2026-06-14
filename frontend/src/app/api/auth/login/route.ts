// apps/frontend/src/app/api/auth/login/route.ts
// Next.js Route Handler — Proxy for backend login
//
// Flow:
// 1. Client sends credentials to this handler (POST /api/auth/login)
// 2. Handler forwards to backend (http://localhost:4000/api/auth/login)
// 3. Handler receives accessToken + refreshToken from backend
// 4. Handler sets refreshToken in httpOnly cookie (cannot be accessed by JavaScript)
// 5. Handler returns accessToken to client (for memory storage)
//
// Reference: DOC-04 Section Middleware Strategy

import { env, isProduction } from "@cermont/config";
import { type NextRequest, NextResponse } from "next/server";
import {
	clearFileAccessTokenCookie,
	isSecureRequest,
	setFileAccessTokenCookie,
} from "@/lib/auth/file-access-cookie";

interface LoginResponseBody {
	success?: boolean;
	data?: {
		accessToken?: string;
	};
	error?: {
		code?: string;
		message?: string;
	};
}

/**
 * POST /api/auth/login
 *
 * Request body (from client):
 * {
 *   email: string;
 *   password: string;
 * }
 *
 * Response 200:
 * {
 *   success: true;
 *   data: {
 *     accessToken: string;
 *     user: { _id, name, email, role, isActive }
 *   }
 * }
 */
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

async function callBackendLogin(
	backendUrl: string,
	email: string,
	password: string,
	attempt = 1,
): Promise<Response> {
	try {
		const response = await fetch(`${backendUrl}/api/auth/login`, {
			method: "POST",
			cache: "no-store",
			signal: AbortSignal.timeout(15000),
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, password }),
			credentials: "include",
		});

		// Retry on 5xx (server errors) or connection errors that indicate transient state
		if (!response.ok && response.status >= 500 && attempt < MAX_RETRIES) {
			await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
			return callBackendLogin(backendUrl, email, password, attempt + 1);
		}

		return response;
	} catch (error) {
		// CRITICAL: Network errors (connection refused, DNS failure, timeout) throw
		// BEFORE we get an HTTP response. The previous code only retried on HTTP 5xx,
		// but connection errors during nodemon restart never reached the retry block.
		// This was the primary cause of 401 after code changes: backend restarting →
		// fetch throws → no retry → error response to client → SW cached the error.
		if (attempt < MAX_RETRIES) {
			await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
			return callBackendLogin(backendUrl, email, password, attempt + 1);
		}
		throw error;
	}
}

export async function POST(request: NextRequest) {
	try {
		// Parse request body from client
		const { email, password } = await request.json();

		if (!email || !password) {
			return NextResponse.json(
				{
					success: false,
					error: {
						code: "VALIDATION_ERROR",
						message: "Email and password are required",
					},
				},
				{ status: 400 },
			);
		}

		// Call backend login endpoint with automatic retry for transient failures.
		// After code changes, the backend might be restarting (nodemon), so
		// we retry up to MAX_RETRIES times with exponential backoff.
		const backendUrl =
			env.BACKEND_URL?.trim() || (isProduction() ? "http://backend:4000" : "http://localhost:4000");
		const response = await callBackendLogin(backendUrl, email, password);

		const data = (await response.json()) as LoginResponseBody;

		// If backend login failed, forward the error
		if (!response.ok) {
			const errorResponse = NextResponse.json(data, { status: response.status });
			clearFileAccessTokenCookie(errorResponse, isSecureRequest(request));
			// CRITICAL: Never cache auth error responses either
			errorResponse.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
			errorResponse.headers.set("Pragma", "no-cache");
			errorResponse.headers.set("Expires", "0");
			return errorResponse;
		}

		// Success — extract refreshToken from backend response headers
		// The backend sets it in Set-Cookie header
		const setCookieHeaders =
			typeof response.headers.getSetCookie === "function"
				? response.headers.getSetCookie()
				: response.headers.get("set-cookie")
					? [response.headers.get("set-cookie") as string]
					: [];

		// Create response with accessToken
		// CRITICAL: Set explicit no-cache headers so the Service Worker
		// never caches the login response. This prevents the SW from
		// serving a stale auth token on subsequent requests.
		const successResponse = NextResponse.json(data, { status: 200 });
		successResponse.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
		successResponse.headers.set("Pragma", "no-cache");
		successResponse.headers.set("Expires", "0");

		// Forward all Set-Cookie headers (including refreshToken) to client
		// The browser will automatically manage the httpOnly cookie
		for (const cookie of setCookieHeaders) {
			successResponse.headers.append("Set-Cookie", cookie);
		}
		setFileAccessTokenCookie(successResponse, data.data?.accessToken, isSecureRequest(request));

		return successResponse;
	} catch (error) {
		console.error("Login handler error:", error);
		const errorResponse = NextResponse.json(
			{
				success: false,
				error: {
					code: "INTERNAL_ERROR",
					message: "Login request failed",
				},
			},
			{ status: 500 },
		);
		clearFileAccessTokenCookie(errorResponse, isSecureRequest(request));
		return errorResponse;
	}
}
