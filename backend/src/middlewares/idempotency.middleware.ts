/**
 * Idempotency Middleware — Safe Retry for Mutations
 *
 * Usage:
 *   router.post('/orders', authenticate, idempotency(), validate(CreateOrderSchema), orderController.create)
 *
 * The client sends an `Idempotency-Key` header (UUID or URL-safe base64).
 * - First request: executes normally, caches the response.
 * - Retry (same key + method + path): returns cached response without re-executing.
 *
 * Design decisions:
 * - Only POST, PATCH, PUT, DELETE are cached (GET must be idempotent by spec).
 * - Only 2xx responses are cached (errors should be retryable).
 * - Total cached response body size is bounded (default 64 KB).
 * - TTL default is 24 hours, configurable per route.
 * - MongoDB TTL index cleans expired documents automatically.
 */

import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import type { JsonValue } from "../common/types/safe-types";
import { createLogger } from "../common/utils/logger";
import { IdempotencyEntry } from "../models/IdempotencyEntry";

const log = createLogger("idempotency");

export interface IdempotencyOptions {
	/** Time-to-live in milliseconds (default: 24 hours) */
	ttlMs?: number;
	/** Maximum response body bytes to cache (default: 64 KB) */
	maxBodyBytes?: number;
	/** Globally unique request ID; falls back to req.id or a new UUID */
	requestId?: string;
}

const DEFAULT_TTL_MS = 86_400_000; // 24 hours
const DEFAULT_MAX_BODY_BYTES = 65_536; // 64 KB
const CACHEABLE_STATUS_CODES = new Set([200, 201, 204]);
const IDEMPOTENT_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

/**
 * Extracts the idempotency key from a request.
 * Priority: Idempotency-Key header > X-Idempotency-Key header > requestId option > req.id > UUID
 */
function extractIdempotencyKey(req: Request, fallbackRequestId?: string): string | undefined {
	return (
		(req.headers["idempotency-key"] as string) ??
		(req.headers["x-idempotency-key"] as string) ??
		fallbackRequestId ??
		(req as { id?: string }).id
	);
}

/**
 * Hashes the key for storage.
 */
function hashKey(key: string): string {
	return crypto.createHash("sha256").update(key).digest("hex");
}

/**
 * Intercepts res.json to capture the response body for caching.
 */
type CapturedResponse = { status: "empty" } | { status: "captured"; body: string };

function interceptJson(res: Response, maxBodyBytes: number): { capture: () => CapturedResponse } {
	const originalJson = res.json.bind(res);
	let capturedResponse: CapturedResponse = { status: "empty" };

	res.json = function interceptedJson(body: JsonValue) {
		const raw = JSON.stringify(body);
		capturedResponse = {
			status: "captured",
			body: raw.length > maxBodyBytes ? raw.slice(0, maxBodyBytes) : raw,
		};
		return originalJson(body);
	};

	return {
		capture: () => capturedResponse,
	};
}

/**
 * Express middleware factory for idempotency.
 */
export function idempotency(options: IdempotencyOptions = {}) {
	const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
	const maxBodyBytes = options.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES;

	return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		// Only apply to mutating methods
		if (!IDEMPOTENT_METHODS.has(req.method)) {
			next();
			return;
		}

		const rawKey = extractIdempotencyKey(req, options.requestId);
		if (!rawKey) {
			next();
			return;
		}

		const hashedKey = hashKey(rawKey);

		try {
			// ── Check for existing cached response ──
			const existing = await IdempotencyEntry.findOne({
				key: hashedKey,
				method: req.method,
				path: req.path,
			});

			if (existing) {
				res.status(existing.statusCode).json(JSON.parse(existing.responseBody));
				return;
			}

			// ── First execution: intercept response and cache on finish ──
			const interceptor = interceptJson(res, maxBodyBytes);

			res.once("finish", () => {
				const capturedResponse = interceptor.capture();
				if (capturedResponse.status === "captured" && CACHEABLE_STATUS_CODES.has(res.statusCode)) {
					const userId =
						(req.user as { _id?: { toString(): string } })?._id?.toString() ?? "anonymous";

					IdempotencyEntry.create({
						key: hashedKey,
						method: req.method,
						path: req.path,
						userId,
						statusCode: res.statusCode,
						responseBody: capturedResponse.body,
						expiresAt: new Date(Date.now() + ttlMs),
					}).catch((error) => {
						log.error("Idempotency cache write failed", {
							error: error instanceof Error ? error : String(error),
							keyHashPrefix: hashedKey.slice(0, 8),
							method: req.method,
							path: req.path,
						});
					});
				}
			});

			next();
		} catch (error) {
			log.warn("Idempotency lookup failed; request will continue without cache", {
				error: error instanceof Error ? error : String(error),
				method: req.method,
				path: req.path,
			});
			next();
		}
	};
}

/**
 * Validates that an Idempotency-Key header is present and well-formed.
 * Use on routes where idempotency is REQUIRED.
 */
export function requireIdempotencyKey(req: Request, _res: Response, next: NextFunction): void {
	const key =
		(req.headers["idempotency-key"] as string) ??
		(req.headers["x-idempotency-key"] as string);

	if (!key) {
		const err = new Error("Idempotency-Key header is required for this endpoint") as Error & {
			statusCode: number;
		};
		err.statusCode = 400;
		next(err);
		return;
	}

	if (!/^[a-zA-Z0-9\-_./@+=]+$/.test(key)) {
		const err = new Error("Idempotency-Key must be URL-safe base64 or UUID format") as Error & {
			statusCode: number;
		};
		err.statusCode = 400;
		next(err);
		return;
	}

	next();
}

/**
 * Generate an idempotency key (helper for client-side use).
 */
export function generateIdempotencyKey(): string {
	return crypto.randomUUID();
}
