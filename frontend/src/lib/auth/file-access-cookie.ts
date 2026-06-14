import type { NextRequest, NextResponse } from "next/server";

export const FILE_ACCESS_TOKEN_COOKIE = "cermontFileAccess";

export function isSecureRequest(request: NextRequest): boolean {
	const forwardedProto = request.headers.get("x-forwarded-proto");
	return (
		request.nextUrl.protocol === "https:" ||
		forwardedProto?.split(",").some((protocol) => protocol.trim().toLowerCase() === "https") ===
			true
	);
}

export function setFileAccessTokenCookie(
	response: NextResponse,
	accessToken: string | undefined,
	secure: boolean,
): void {
	if (!accessToken) {
		return;
	}

	const secureAttribute = secure ? "; Secure" : "";
	response.headers.append(
		"Set-Cookie",
		`${FILE_ACCESS_TOKEN_COOKIE}=${encodeURIComponent(accessToken)}; Path=/; HttpOnly; SameSite=Lax${secureAttribute}`,
	);
}

export function clearFileAccessTokenCookie(response: NextResponse, secure: boolean): void {
	const secureAttribute = secure ? "; Secure" : "";
	response.headers.append(
		"Set-Cookie",
		`${FILE_ACCESS_TOKEN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureAttribute}`,
	);
}
