import { env, isProduction } from "@cermont/config";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const { token, password } = await request.json();

		if (!token || !password) {
			return NextResponse.json(
				{
					success: false,
					error: { code: "VALIDATION_ERROR", message: "Token and password are required" },
				},
				{ status: 400 },
			);
		}

		const backendUrl =
			env.BACKEND_URL?.trim() || (isProduction() ? "http://backend:4000" : "http://localhost:4000");
		const response = await fetch(`${backendUrl}/api/auth/reset-password`, {
			method: "POST",
			cache: "no-store",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token, password }),
			credentials: "include",
		});

		const data = await response.json();

		if (!response.ok) {
			return NextResponse.json(data, { status: response.status });
		}

		return NextResponse.json(data, { status: 200 });
	} catch (error) {
		console.error("Reset password handler error:", error);
		return NextResponse.json(
			{
				success: false,
				error: { code: "BACKEND_UNAVAILABLE", message: "El servicio no está disponible." },
			},
			{ status: 503 },
		);
	}
}
