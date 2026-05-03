import type { NextRequest } from "next/server";
import {
	REFRESH_TOKEN_COOKIE_NAME,
	type VerifiedRefreshTokenClaims,
	verifyRefreshToken,
} from "@/_shared/lib/auth/refresh-token";

/**
 * Extract the refresh token from the httpOnly cookie on the incoming request.
 */
export function extractRefreshTokenFromCookie(request: NextRequest): string | null {
	return request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value ?? null;
}

/**
 * Verify the refresh token used by the proxy perimeter before routing.
 */
export async function getVerifiedRefreshTokenClaims(
	request: NextRequest,
): Promise<VerifiedRefreshTokenClaims | null> {
	const token = extractRefreshTokenFromCookie(request);
	if (!token) {
		return null;
	}

	return await verifyRefreshToken(token);
}
