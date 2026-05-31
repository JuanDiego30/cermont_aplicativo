/**
 * JWT-based Session Management (Option B - Pure JWT from Backend)
 *
 * Replaces NextAuth with direct JWT token management.
 * Token is stored strictly in httpOnly cookie (server).
 */

import { isAuthenticatedRole, type UserRole } from "@cermont/domain";
import { redirect } from "next/navigation";
import { getCookieToken } from "@/lib/http/server-auth";
import { useAuthStore } from "@/store/auth.store";
import { isPresent, type StatusObject } from "@cermont/shared-types";

// ── Strong types for authenticated sessions ──────────────────────────
type AuthenticatedUser = {
	id: string;
	email: string;
	name: string;
	role: UserRole;
};

export type AuthenticatedSession = {
	user: AuthenticatedUser;
	// Token is not exposed - managed by auth-storage
};

// ── Public API ───────────────────────────────────────────────

// Decoding is used EXCLUSIVELY on the server to read details from the HttpOnly cookie
function decodeJWT(token: string): { id: string; role: string } | null {
	try {
		if (typeof window !== "undefined") {
			throw new Error("JWT decoding should never happen on the client.");
		}
		const payload = token.split(".")[1];
		if (!payload) {
			return null;
		}
		const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf-8")) as {
			id?: string;
			_id?: string;
			sub?: string;
			role?: string;
		};
		const id = decoded.sub ?? decoded.id ?? decoded._id;
		if (!id || !decoded.role) {
			return null;
		}
		return { id, role: decoded.role };
	} catch {
		return null;
	}
}

/**
 * Get current session (may be null if unauthenticated).
 * Server-side: reads from httpOnly cookie
 * Client-side: reads from the in-memory auth store
 */
export async function getSession(): Promise<AuthenticatedSession | null> {
	if (typeof window !== "undefined") {
		// Client-side: use the global auth store since we can't read the HttpOnly cookie
		const userStatus: StatusObject<AuthenticatedUser> = useAuthStore.getState().user;
		if (!isPresent(userStatus)) {
			return null;
		}
		return {
			user: {
				id: userStatus.value.id,
				email: userStatus.value.email,
				name: userStatus.value.name,
				role: userStatus.value.role,
			},
		};
	} else {
		// Server-side: read from cookie
		const token = await getCookieToken();
		if (!token) {
			return null;
		}

		const decoded = decodeJWT(token);
		if (!decoded) {
			return null;
		}

		const normalizedRole = isAuthenticatedRole(decoded.role) ? decoded.role : null;
		if (!normalizedRole) {
			return null;
		}

		return {
			user: {
				id: decoded.id,
				email: "",
				name: "",
				role: normalizedRole,
			},
		};
	}
}

/**
 * Get current session or redirect to /login.
 * Returns a strongly-typed `AuthenticatedSession` — no inline casts needed.
 */
async function getRequiredSession(): Promise<AuthenticatedSession> {
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

/**
 * Checks if a user has any of the allowed roles.
 */
function hasRole(
	userRole: UserRole | string,
	allowedRoles: UserRole[] | readonly UserRole[],
): boolean {
	return allowedRoles.includes(userRole as UserRole);
}
