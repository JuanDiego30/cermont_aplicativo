// src/lib/http/server-auth.ts
// Server-side auth utilities

import { cookies } from "next/headers";

const ACCESS_TOKEN_KEY = "refreshToken";

/**
 * Get token from cookie (server-side) - returns null if no token
 */
export async function getCookieToken(): Promise<string | null> {
	try {
		const cookieStore = await cookies();
		return cookieStore.get(ACCESS_TOKEN_KEY)?.value ?? null;
	} catch {
		// cookies() throws when called outside request context
		// Return null in test environments
		return null;
	}
}
