import { env, isProduction } from "@cermont/shared-types/config";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const formData = await request.formData();

	const payload = {
		fullName: String(formData.get("fullName") ?? "").trim(),
		email: String(formData.get("email") ?? "").trim(),
		company: String(formData.get("company") ?? "").trim(),
		nit: String(formData.get("nit") ?? "").trim(),
		phone: String(formData.get("phone") ?? "").trim(),
		contractRef: String(formData.get("contractRef") ?? "").trim(),
	};

	const backendBaseUrl =
		env.BACKEND_URL?.trim() || (isProduction() ? "http://backend:4000" : "http://127.0.0.1:5000");
	const normalizedBaseUrl = backendBaseUrl.replace(/\/+$/, "");
	const apiRoot = `${normalizedBaseUrl}/api`;

	try {
		const response = await fetch(`${apiRoot}/auth/register-client`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
			cache: "no-store",
		});

		if (response.ok) {
			return NextResponse.redirect(new URL("/register?status=submitted", request.url), 303);
		}

		if (response.status === 409) {
			return NextResponse.redirect(new URL("/register?status=duplicate", request.url), 303);
		}

		if (response.status === 400 || response.status === 422) {
			return NextResponse.redirect(new URL("/register?status=invalid", request.url), 303);
		}

		return NextResponse.redirect(new URL("/register?status=error", request.url), 303);
	} catch {
		return NextResponse.redirect(new URL("/register?status=error", request.url), 303);
	}
}
