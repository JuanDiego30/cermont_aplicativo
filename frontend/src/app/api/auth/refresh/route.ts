// apps/frontend/src/app/api/auth/refresh/route.ts
// Dedicated Next.js Route Handler for token refresh.
//
// Flow:
// 1. Client sends POST (no body — refresh token is in the httpOnly cookie)
// 2. Handler forwards to backend POST /api/auth/refresh
// 3. Backend validates the refresh token cookie, rotates it, returns new accessToken
// 4. Handler forwards the rotated refreshToken Set-Cookie header and returns accessToken
//
// Dedicated route (vs. generic proxy) so we can:
//   - Retry after backend restarts (nodemon / tsx watch)
//   - Set explicit no-cache headers so the SW never caches the response

import { env, isProduction } from "@cermont/config";
import { type NextRequest, NextResponse } from "next/server";
import {
	clearFileAccessTokenCookie,
	isSecureRequest,
	setFileAccessTokenCookie,
} from "@/lib/auth/file-access-cookie";

interface RefreshResponseBody {
	success?: boolean;
	data?: {
		accessToken?: string;
	};
	error?: {
		code?: string;
		message?: string;
	};
}

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

async function callBackendRefresh(
	backendUrl: string,
	cookieHeader: string | null,
	attempt = 1,
): Promise<Response> {
	const headers: HeadersInit = { "Content-Type": "application/json" };
	if (cookieHeader) {
		headers.Cookie = cookieHeader;
	}
	try {
		const response = await fetch(`${backendUrl}/api/auth/refresh`, {
			method: "POST",
			cache: "no-store",
			signal: AbortSignal.timeout(15_000),
			headers,
			credentials: "include",
		});
		if (!response.ok && response.status >= 500 && attempt < MAX_RETRIES) {
			await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
			return callBackendRefresh(backendUrl, cookieHeader, attempt + 1);
		}
		return response;
	} catch (error) {
		if (attempt < MAX_RETRIES) {
			await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
			return callBackendRefresh(backendUrl, cookieHeader, attempt + 1);
		}
		throw error;
	}
}

export async function POST(request: NextRequest) {
	try {
		const backendUrl =
			env.BACKEND_URL?.trim() || (isProduction() ? "http://backend:4000" : "http://localhost:4000");

		// Forward the browser's cookies to the backend so it can read refreshToken
		const cookieHeader = request.headers.get("cookie");
		const response = await callBackendRefresh(backendUrl, cookieHeader);

		const data = (await response.json()) as RefreshResponseBody;

		const setCookieHeaders =
			typeof response.headers.getSetCookie === "function"
				? response.headers.getSetCookie()
				: response.headers.get("set-cookie")
					? [response.headers.get("set-cookie") as string]
					: [];

		const result = NextResponse.json(data, { status: response.status });
		result.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
		result.headers.set("Pragma", "no-cache");
		result.headers.set("Expires", "0");

		for (const cookie of setCookieHeaders) {
			result.headers.append("Set-Cookie", cookie);
		}
		if (response.ok) {
			setFileAccessTokenCookie(result, data.data?.accessToken, isSecureRequest(request));
		} else {
			clearFileAccessTokenCookie(result, isSecureRequest(request));
		}

		return result;
	} catch (error) {
		console.error("Refresh handler error:", error);
		const errorResponse = NextResponse.json(
			{
				success: false,
				error: {
					code: "INTERNAL_ERROR",
					message: "Token refresh failed",
				},
			},
			{ status: 500 },
		);
		clearFileAccessTokenCookie(errorResponse, isSecureRequest(request));
		return errorResponse;
	}
}
