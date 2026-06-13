import type { Request, Response } from "express";
import {
	ipKeyGenerator,
	MemoryStore,
	type Options,
	rateLimit,
	type Store,
} from "express-rate-limit";
import { MongoRateLimitStore } from "../common/security/mongo-rate-limit.store";
import { shouldSkipAuthRateLimit, shouldSkipGlobalRateLimit } from "../common/security/rate-limit";
import { env } from "../config/env";

function createStore(prefix: string): Store {
	if (env.NODE_ENV === "production") {
		return new MongoRateLimitStore({ prefix });
	}
	return new MemoryStore();
}

function clientKey(req: Request): string {
	return ipKeyGenerator(req.ip || req.socket.remoteAddress || "unknown");
}

function handleRateLimit(_req: Request, res: Response, _next: () => void, options: Options): void {
	if (!res.getHeader("Retry-After")) {
		res.setHeader("Retry-After", String(Math.ceil(options.windowMs / 1000)));
	}
	res.status(429).json({
		success: false,
		error: {
			code: "RATE_LIMIT_EXCEEDED",
			message: "Demasiadas solicitudes. Intenta nuevamente más tarde.",
		},
	});
}

export function createGeneralLimiter() {
	return rateLimit({
		windowMs: 15 * 60 * 1000,
		limit: 100,
		standardHeaders: true,
		legacyHeaders: false,
		keyGenerator: clientKey,
		skip: shouldSkipGlobalRateLimit,
		store: createStore("general:"),
		handler: handleRateLimit,
	});
}

export function createAuthLimiter(limit = env.NODE_ENV === "test" ? 1000 : 5) {
	return rateLimit({
		windowMs: 60 * 1000,
		limit,
		standardHeaders: true,
		legacyHeaders: false,
		keyGenerator: clientKey,
		skip: shouldSkipAuthRateLimit,
		store: createStore("auth:"),
		handler: handleRateLimit,
	});
}

export function createRefreshLimiter() {
	return rateLimit({
		windowMs: 60 * 1000,
		limit: 30,
		standardHeaders: true,
		legacyHeaders: false,
		keyGenerator: clientKey,
		store: createStore("refresh:"),
		handler: handleRateLimit,
	});
}

export function createUploadLimiter() {
	return rateLimit({
		windowMs: 60 * 1000,
		limit: 10,
		standardHeaders: true,
		legacyHeaders: false,
		keyGenerator: clientKey,
		store: createStore("upload:"),
		handler: handleRateLimit,
	});
}

export const generalLimiter = createGeneralLimiter();
export const authLimiter = createAuthLimiter();
export const refreshLimiter = createRefreshLimiter();
export const uploadLimiter = createUploadLimiter();
