/**
 * Request ID Middleware
 *
 * Generates a unique correlation ID per request for distributed tracing.
 * Reuses existing header from upstream proxy/load balancer when present.
 *
 * Usage:
 *   app.use(requestId)
 *
 * Access in handlers:
 *   req.requestId
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

const REQUEST_ID_HEADER = "x-request-id" as const;
const RESPONSE_ID_HEADER = "X-Request-Id" as const;

export function requestId(req: Request, res: Response, next: NextFunction): void {
	const incomingId = req.headers[REQUEST_ID_HEADER];
	req.requestId =
		typeof incomingId === "string" && incomingId.length > 0 ? incomingId : randomUUID();

	res.setHeader(RESPONSE_ID_HEADER, req.requestId);
	next();
}
