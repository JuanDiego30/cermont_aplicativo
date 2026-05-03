import type { UserRoleInput } from "@cermont/shared-types/rbac";
import type { Request } from "express";
import { z } from "zod";
import { UnauthorizedError } from "../errors";

export interface AuthPayload {
	_id: string;
	email?: string;
	role: UserRoleInput;
	jti?: string;
}

const AuthTokenPayloadSchema = z
	.object({
		_id: z.string().min(1).optional(),
		sub: z.string().min(1).optional(),
		email: z.string().email().optional(),
		role: z.string().min(1),
		jti: z.string().min(1).optional(),
	})
	.refine((payload) => Boolean(payload.sub ?? payload._id), {
		message: "JWT subject is required",
		path: ["sub"],
	});

export function parseAuthTokenPayload(value: string | object) {
	const result = AuthTokenPayloadSchema.safeParse(value);
	if (!result.success) {
		throw new UnauthorizedError("Invalid access token payload");
	}

	return result.data;
}

export function toAuthPayload(
	payload: ReturnType<typeof parseAuthTokenPayload>,
	role: UserRoleInput,
): AuthPayload {
	const subject = payload.sub ?? payload._id;
	if (!subject) {
		throw new UnauthorizedError("Invalid access token payload");
	}

	return {
		_id: subject,
		...(payload.email ? { email: payload.email } : {}),
		role,
		...(payload.jti ? { jti: payload.jti } : {}),
	};
}

export function getString(value: unknown): string {
	if (typeof value === "string") {
		return value;
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
