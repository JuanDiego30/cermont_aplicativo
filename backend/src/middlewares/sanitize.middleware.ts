import type { NextFunction, Request, Response } from "express";
import mongoSanitize from "express-mongo-sanitize";

export const sanitizeInput = mongoSanitize({
	replaceWith: "_",
	onSanitize: ({ req, key }: { req: Request; key: string }) => {
		if (key.startsWith("$")) {
			(
				req as Request & { log?: { warn: (msg: string, meta?: Record<string, unknown>) => void } }
			).log?.warn?.("NoSQL injection attempt blocked", { path: req.path, key });
		}
	},
});

export function sanitizeStrings(obj: Record<string, unknown>): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(obj)) {
		if (typeof value === "string") {
			result[key] = value
				.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
				.replace(/on\w+="[^"]*"/gi, "")
				.replace(/javascript:/gi, "");
		} else if (typeof value === "object" && value !== null) {
			result[key] = sanitizeStrings(value as Record<string, unknown>);
		} else {
			result[key] = value;
		}
	}
	return result;
}

export function sanitizeAll(req: Request, _res: Response, next: NextFunction): void {
	if (req.body) {
		req.body = sanitizeStrings(req.body);
	}
	if (req.query) {
		req.query = sanitizeStrings(
			req.query as unknown as Record<string, unknown>,
		) as typeof req.query;
	}
	if (req.params) {
		req.params = sanitizeStrings(req.params as Record<string, unknown>) as Request["params"];
	}
	next();
}
