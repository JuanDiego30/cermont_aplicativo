// apps/frontend/src/app/api/auth/forgot-password/route.ts
// Next.js Route Handler — Proxy for backend forgot-password

import { env, isProduction } from "@cermont/config";
import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/forgot-password
 *
 * Request body (from client):
 * {
 *   email: string;
 * }
 *
 * Response 200:
 * {
 *   success: true;
 *   message: "If the email exists, a reset link has been sent";
 * }
 */
export async function POST(request: NextRequest) {
	try {
		const { email } = await request.json();

		if (!email) {
			return NextResponse.json(
				{
					success: false,
					error: {
						code: "VALIDATION_ERROR",
						message: "Email is required",
					},
				},
				{ status: 400 },
			);
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{
					success: false,
					error: {
						code: "VALIDATION_ERROR",
						message: "Invalid email format",
					},
				},
				{ status: 400 },
			);
		}

		// Call backend forgot-password endpoint
		const backendUrl =
			env.BACKEND_URL?.trim() || (isProduction() ? "http://backend:4000" : "http://localhost:4000");
		await fetch(`${backendUrl}/api/auth/forgot-password`, {
			method: "POST",
			cache: "no-store",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email }),
			credentials: "include",
		});

		// Always return success to avoid email enumeration
		// The backend should also follow this pattern
		return NextResponse.json(
			{
				success: true,
				message: "If the email exists, a reset link has been sent",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Forgot password handler error:", error);
		// Still return success to avoid information leakage
		return NextResponse.json(
			{
				success: true,
				message: "If the email exists, a reset link has been sent",
			},
			{ status: 200 },
		);
	}
}
