/**
 * Request ID Middleware
 *
 * NestJS-equivalent: Interceptor for request tracing.
 * Generates unique ID per request for correlation across logs.
 *
 * Usage:
 *   app.use(requestId)
 *
 * Then in handler functions:
 *   const reqId = req.headers['x-request-id']
 */

import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { runWithRequestContext } from "../observability/request-context";

declare global {
	namespace Express {
		interface Request {
			requestId: string;
		}
	}
}

export function requestId(req: Request, _res: Response, next: NextFunction): void {
	const upstreamRequestId = req.get("x-request-id") ?? "";
	const isSafeUpstreamId =
		upstreamRequestId.length > 0 &&
		upstreamRequestId.length <= 128 &&
		/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(upstreamRequestId);

	req.requestId = isSafeUpstreamId ? upstreamRequestId : randomUUID();

	// Set response header for client correlation
	_res.setHeader("X-Request-Id", req.requestId);

	runWithRequestContext(
		{
			requestId: req.requestId,
			ipAddress: req.ip || req.socket.remoteAddress || "not_available",
			userAgent: req.get("user-agent") ?? "not_provided",
		},
		next,
	);
}
