import type { UserRole } from "@cermont/domain";
import type { Request } from "express";
import { UnauthorizedError } from "../errors";

export interface AuthClaims {
	_id: string;
	sub?: string;
	email?: string;
	role: UserRole;
	jti?: string;
	tokenVersion?: number;
}

export function getString(value?: string | string[] | number): string {
	if (typeof value === "string") {
		return value;
	}
	if (typeof value === "number") {
		return String(value);
	}
	if (Array.isArray(value) && typeof value[0] === "string") {
		return value[0];
	}
	return "";
}

export function requireUser(req: Request): AuthClaims {
	if (!req.user) {
		throw new UnauthorizedError("User context required");
	}

	return req.user;
}
