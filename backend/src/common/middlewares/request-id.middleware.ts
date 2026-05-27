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

declare global {
	namespace Express {
		interface Request {
			requestId: string;
		}
	}
}

export function requestId(req: Request, _res: Response, next: NextFunction): void {
	// Use existing header (from proxy/load balancer) or generate new
	req.requestId = (req.headers["x-request-id"] as string) || randomUUID();

	// Set response header for client correlation
	_res.setHeader("X-Request-Id", req.requestId);

	next();
}
