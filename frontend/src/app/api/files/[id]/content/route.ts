import { env, isProduction } from "@cermont/config";
import { type NextRequest, NextResponse } from "next/server";

import { FILE_ACCESS_TOKEN_COOKIE } from "@/lib/auth/file-access-cookie";
import { createLogger } from "@/lib/monitoring/logger";

const logger = createLogger("API:file-content");

type RouteContext = {
	params: Promise<{ id: string }>;
};

function resolveBackendBaseUrl(): string {
	return (
		env.BACKEND_URL?.trim() || (isProduction() ? "http://backend:4000" : "http://localhost:4000")
	).replace(/\/+$/, "");
}

export async function GET(request: NextRequest, context: RouteContext): Promise<NextResponse> {
	const accessToken = request.cookies.get(FILE_ACCESS_TOKEN_COOKIE)?.value;
	if (!accessToken) {
		return NextResponse.json(
			{ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
			{ status: 401 },
		);
	}

	const { id } = await context.params;
	if (!id) {
		return NextResponse.json(
			{ success: false, error: { code: "BAD_REQUEST", message: "File id is required" } },
			{ status: 400 },
		);
	}

	try {
		const backendResponse = await fetch(
			`${resolveBackendBaseUrl()}/api/files/${encodeURIComponent(id)}/content`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					Accept: request.headers.get("accept") ?? "*/*",
					"X-Request-Id": request.headers.get("x-request-id") ?? crypto.randomUUID(),
				},
				cache: "no-store",
				signal: AbortSignal.timeout(20_000),
			},
		);

		const body = await backendResponse.arrayBuffer();
		const response = new NextResponse(body, {
			status: backendResponse.status,
			statusText: backendResponse.statusText,
		});

		for (const headerName of ["content-type", "content-disposition", "etag", "last-modified"]) {
			const value = backendResponse.headers.get(headerName);
			if (value) {
				response.headers.set(headerName, value);
			}
		}
		response.headers.set("Cache-Control", "private, no-store");
		return response;
	} catch (error) {
		logger.warn("Protected file content unavailable", {
			fileId: id,
			error: error instanceof Error ? error.message : "Backend request failed",
		});
		return NextResponse.json(
			{
				success: false,
				error: { code: "BACKEND_UNAVAILABLE", message: "File content is unavailable" },
			},
			{ status: 503 },
		);
	}
}
