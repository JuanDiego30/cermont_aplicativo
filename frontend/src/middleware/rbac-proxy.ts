/**
 * RBAC Proxy — Route-to-role access control for the Next.js 16 proxy layer.
 *
 * Reuses the single source of truth from `@cermont/shared-types/rbac`
 * to enforce route-level authorization at the network boundary.
 */

import { canAccessPath, isPublicPath, normalizeUserRole } from "@cermont/shared-types/rbac";

export interface AccessCheckResult {
	allowed: boolean;
	redirect?: string;
}

/**
 * Check whether a given role may access a specific pathname.
 *
 * Returns a structured result that the proxy can use to decide
 * redirect vs rewrite vs continue.
 */
export function checkRouteAccess(pathname: string, role: string | null): AccessCheckResult {
	if (isPublicPath(pathname)) {
		return { allowed: true };
	}

	const normalizedRole = role ? normalizeUserRole(role) : false;
	if (!normalizedRole) {
		return { allowed: false, redirect: "/login" };
	}

	if (canAccessPath(pathname, normalizedRole)) {
		return { allowed: true };
	}

	return { allowed: false, redirect: "/unauthorized" };
}
