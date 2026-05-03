import { cookies } from "next/headers";
import {
	REFRESH_TOKEN_COOKIE_NAME,
	type VerifiedRefreshTokenClaims,
	verifyRefreshToken,
} from "@/_shared/lib/auth/refresh-token";

/**
 * Get the refresh token from the HttpOnly cookie on the server.
 */
export async function getRefreshTokenFromCookie(): Promise<string | null> {
	try {
		const cookieStore = await cookies();
		return cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value ?? null;
	} catch {
		// cookies() throws outside an active request context.
		return null;
	}
}

/**
 * Backward-compatible alias while callers migrate to refresh-token naming.
 */
export async function getCookieToken(): Promise<string | null> {
	return await getRefreshTokenFromCookie();
}

export async function getVerifiedRefreshTokenClaims(): Promise<VerifiedRefreshTokenClaims | null> {
	const refreshToken = await getRefreshTokenFromCookie();
	if (!refreshToken) {
		return null;
	}

	return await verifyRefreshToken(refreshToken);
}

/**
 * Check whether the current request has a valid refresh token cookie.
 */
export async function hasValidToken(): Promise<boolean> {
	const claims = await getVerifiedRefreshTokenClaims();
	return claims !== null;
}
