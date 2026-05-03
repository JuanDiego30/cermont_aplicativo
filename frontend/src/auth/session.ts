/**
 * JWT-based Session Management (Option B - Pure JWT from Backend)
 *
 * Uses the backend-managed refresh token stored in an HttpOnly cookie.
 */

import { hasRole, type UserRole } from "@cermont/shared-types/rbac";
import { redirect } from "next/navigation";
import { getVerifiedRefreshTokenClaims } from "@/_shared/lib/http/server-auth";
import { useAuthStore } from "@/_shared/store/auth.store";

// ── Strong types for authenticated sessions ──────────────────────────
export type AuthenticatedUser = {
	id: string;
	email: string | null;
	name: string | null;
	role: UserRole;
};

export type AuthenticatedSession = {
	user: AuthenticatedUser;
	// Token is not exposed - managed by auth-storage
};

/**
 * Get current session (may be null if unauthenticated).
 * Server-side: reads from httpOnly cookie
 * Client-side: reads from the in-memory auth store
 */
export async function getSession(): Promise<AuthenticatedSession | null> {
	if (typeof window !== "undefined") {
		// Client-side: use the global auth store since we can't read the HttpOnly cookie
		const user = useAuthStore.getState().user;
		if (!user) {
			return null;
		}
		return {
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role,
			},
		};
	} else {
		const verifiedClaims = await getVerifiedRefreshTokenClaims();
		if (!verifiedClaims) {
			return null;
		}

		return {
			user: {
				id: verifiedClaims.subjectId,
				email: null,
				name: null,
				role: verifiedClaims.role,
			},
		};
	}
}

/**
 * Alias for backward compatibility
 */
export async function getServerSessionWrapper(): Promise<AuthenticatedSession | null> {
	return getSession();
}

/**
 * Re-export for backward compatibility
 */
export { getServerSessionWrapper as auth };

/**
 * Get current session or redirect to /login.
 * Returns a strongly-typed `AuthenticatedSession` — no inline casts needed.
 */
export async function getRequiredSession(): Promise<AuthenticatedSession> {
	const session = await getSession();

	if (!session?.user?.id) {
		redirect("/login");
	}

	return session;
}

/**
 * Require that the current user has one of the specified roles,
 * or redirect to /unauthorized.
 */
export async function requireRole(
	allowedRoles: readonly UserRole[],
): Promise<AuthenticatedSession> {
	const session = await getRequiredSession();

	if (!hasRole(session.user.role, allowedRoles)) {
		redirect("/unauthorized");
	}

	return session;
}
