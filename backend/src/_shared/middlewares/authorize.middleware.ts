/**
 * Authorization Middleware — RBAC (Role-Based Access Control)
 *
 * DOC-04 compliance:
 * - Checks if authenticated user has required role(s)
 * - Throws UnauthorizedError when auth context is missing
 * - Throws ForbiddenError if insufficient permissions
 * - All transitions respect role hierarchy
 *
 * SSOT: @cermont/shared-types/rbac for role definitions
 * DOC REFERENCE: DOC-04 §6 (RBAC), DOC-11 (Reglas del agente)
 */

import {
	ADMIN_ROLES,
	ALL_AUTHENTICATED_ROLES,
	normalizeUserRole,
	ROLE_HIERARCHY,
	type UserRole,
	type UserRoleInput,
} from "@cermont/shared-types/rbac";
import type { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../common/errors";
import { requireUser } from "../common/utils/request";

/**
 * Middleware: Check if user has required role(s)
 * Throws ForbiddenError if not authorized
 *
 * @param requiredRoles - One or more roles that satisfy the requirement
 * @returns Express middleware
 *
 * Usage:
 *   authorize('gerente', 'residente')  // User must be gerente OR residente
 */
export function authorize(...requiredRoles: UserRoleInput[]) {
	return (req: Request, _res: Response, next: NextFunction): void => {
		const user = requireUser(req);
		const userRole = normalizeUserRole(user.role);

		// Check if user's role is in the allowed list
		if (!userRole || !requiredRoles.some((role) => normalizeUserRole(role) === userRole)) {
			throw new ForbiddenError(
				`Access denied. Required role(s): ${requiredRoles.join(", ")}. You have: ${user.role}`,
			);
		}

		next();
	};
}

export function authorizeAllAuthenticated() {
	return authorize(...ALL_AUTHENTICATED_ROLES);
}

/**
 * Middleware: Check if user has minimum role level
 * Useful for checking "at least this level or higher"
 *
 * @param minimumRole - Minimum required role in hierarchy
 * @returns Express middleware
 *
 * Usage:
 *   authorizeMinimum('supervisor')  // gerente, residente, supervisor allowed; not operador, tecnico, etc.
 */
export function authorizeMinimum(minimumRole: UserRole) {
	return (req: Request, _res: Response, next: NextFunction): void => {
		const user = requireUser(req);
		const minimumLevel = ROLE_HIERARCHY[minimumRole];
		const userRole = normalizeUserRole(user.role);
		if (!userRole) {
			throw new ForbiddenError("Access denied. Invalid user role.");
		}
		const userLevel = ROLE_HIERARCHY[userRole];

		if (userLevel > minimumLevel) {
			throw new ForbiddenError(
				`Access denied. Minimum role required: ${minimumRole}. You have: ${user.role}`,
			);
		}

		next();
	};
}

/**
 * Middleware: Check if user is self or admin
 * Useful for personal data access (e.g., user profile)
 *
 * @returns Express middleware
 *
 * Usage:
 *   app.get('/api/users/:userId', authenticate, authorizeOwnerOrAdmin('userId'), handler)
 *
 * If URL has :userId and req.user._id equals it, allow.
 * If user is in ADMIN_ROLES, always allow.
 */
export function authorizeOwnerOrAdmin(paramName: string = "userId") {
	return (req: Request, _res: Response, next: NextFunction): void => {
		const user = requireUser(req);
		const resourceId = req.params[paramName];
		const userRole = normalizeUserRole(user.role);
		const isAdmin = userRole ? ADMIN_ROLES.some((role) => role === userRole) : false;
		const isOwner = user._id === resourceId;

		if (!isAdmin && !isOwner) {
			throw new ForbiddenError("Access denied. You can only access your own resources.");
		}

		next();
	};
}
