// apps/frontend/src/app/api/auth/login/route.ts
// Next.js Route Handler — Proxy for backend login
//
// Flow:
// 1. Client sends credentials to this handler (POST /api/auth/login)
// 2. Handler forwards to backend (http://127.0.0.1:5000/api/auth/login)
// 3. Handler receives accessToken + refreshToken from backend
// 4. Handler sets refreshToken in httpOnly cookie (cannot be accessed by JavaScript)
// 5. Handler returns accessToken to client (for memory storage)
//
// Reference: DOC-04 Section Middleware Strategy

import { env, isProduction } from "@cermont/shared-types/config";
import { type NextRequest, NextResponse } from "next/server";

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

		// Call backend login endpoint
		// Backend runs on port 5000 (see apps/backend/.env PORT=5000)
		const backendUrl =
			env.BACKEND_URL?.trim() || (isProduction() ? "http://backend:4000" : "http://127.0.0.1:5000");
		const response = await fetch(`${backendUrl}/api/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, password }),
			credentials: "include", // Include cookies from backend
		});

		const data = await response.json();

		// If backend login failed, forward the error
		if (!response.ok) {
			return NextResponse.json(data, { status: response.status });
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
		const successResponse = NextResponse.json(data, { status: 200 });

		// Forward all Set-Cookie headers (including refreshToken) to client
		// The browser will automatically manage the httpOnly cookie
		for (const cookie of setCookieHeaders) {
			successResponse.headers.append("Set-Cookie", cookie);
		}

		return successResponse;
	} catch (error) {
		console.error("Login handler error:", error);
		return NextResponse.json(
			{
				success: false,
				error: {
					code: "INTERNAL_ERROR",
					message: "Login request failed",
				},
			},
			{ status: 500 },
		);
	}
}
