import type { UserRole } from "@cermont/domain";
import type { Request } from "express";
import { UnauthorizedError } from "../errors";

export interface AuthPayload {
	_id: string;
	email?: string;
	role: UserRole;
	jti?: string;
}

export function getString(value: string | string[] | number | null | undefined): string {
	if (typeof value === "string") {
		return value;
	}
	if (typeof value === "number") {
		return String(value);
	}
	if (value === null || value === undefined) {
		return "";
	}
	if (Array.isArray(value) && typeof value[0] === "string") {
		return value[0];
	}
	return "";
}

export function requireUser(req: Request): AuthPayload {
	if (!req.user) {
		throw new UnauthorizedError("User context required");
	}

	return req.user;
}
