import { normalizeUserRole, type UserRoleInput } from "@cermont/shared-types/rbac";
import type { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "../errors";

/**
 * RBAC authorization guard.
 * Usage: router.get('/', authorize('gerente', 'residente'), controller)
 */
export function authorize(...allowedRoles: UserRoleInput[]) {
	return (req: Request, _res: Response, next: NextFunction): void => {
		if (!req.user) {
			next(new UnauthorizedError("Authentication required"));
			return;
		}

		const userRole = normalizeUserRole(req.user.role);
		if (!userRole || !allowedRoles.some((role) => normalizeUserRole(role) === userRole)) {
			next(
				new ForbiddenError(
					`Role "${req.user.role}" is not authorized. Allowed: ${allowedRoles.join(", ")}`,
				),
			);
			return;
		}

		next();
	};
}
