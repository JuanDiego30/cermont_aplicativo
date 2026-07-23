// apps/frontend/src/app/api/auth/reset-password/route.ts
// Next.js Route Handler — Proxy for backend reset-password

import { env, isProduction } from "@cermont/config";
import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/reset-password
 *
 * Request body (from client):
 * {
 *   token: string;
 *   password: string;
 * }
 *
 * Response 200:
 * {
 *   success: true;
 *   message: "Password reset successfully";
 * }
 *
 * Response 400:
 * {
 *   success: false;
 *   error: { code: string; message: string; }
 * }
 */
export async function POST(request: NextRequest) {
	try {
		const { token, password } = await request.json();

		if (!token || typeof token !== "string") {
			return NextResponse.json(
				{
					success: false,
					error: { code: "VALIDATION_ERROR", message: "Token is required" },
				},
				{ status: 400 },
			);
		}

		if (!password || typeof password !== "string" || password.length < 8) {
			return NextResponse.json(
				{
					success: false,
					error: { code: "VALIDATION_ERROR", message: "Password must be at least 8 characters" },
				},
				{ status: 400 },
			);
		}

		const backendUrl =
			env.BACKEND_URL?.trim() || (isProduction() ? "http://backend:4000" : "http://localhost:4000");

		const backendResponse = await fetch(`${backendUrl}/api/auth/reset-password`, {
			method: "POST",
			cache: "no-store",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token, password }),
			credentials: "include",
		});

		const data = await backendResponse.json();

		if (!backendResponse.ok) {
			return NextResponse.json(
				{
					success: false,
					error: {
						code: data?.error?.code || "RESET_FAILED",
						message: data?.error?.message || "Error al restablecer la contraseña",
					},
				},
				{ status: backendResponse.status },
			);
		}

		return NextResponse.json(data, { status: 200 });
	} catch (error) {
		console.error("Reset password handler error:", error);
		return NextResponse.json(
			{
				success: false,
				error: { code: "INTERNAL_ERROR", message: "Error al restablecer la contraseña" },
			},
			{ status: 500 },
		);
	}
}
