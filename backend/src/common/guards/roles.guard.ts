import type { UserRole } from "@cermont/domain";
import type { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "../errors";

/**
 * RBAC authorization guard.
 * Usage: router.get('/', authorize('gerente', 'residente'), controller);
 */
export function authorize(...allowedRoles: UserRole[]) {
	return (req: Request, _res: Response, next: NextFunction) => {
		if (!req.user) {
			return next(new UnauthorizedError("Authentication required"));
		}

		if (!allowedRoles.includes(req.user.role)) {
			return next(
				new ForbiddenError(
					`Role "${req.user.role}" is not authorized. Allowed: ${allowedRoles.join(", ")}`,
				),
			);
		}

		next();
	};
}
