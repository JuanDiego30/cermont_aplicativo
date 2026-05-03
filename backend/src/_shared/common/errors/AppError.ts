/*/**
 * AppError — Base Application Error Class
 *
 * NestJS-inspired error hierarchy for Express 5.
 * All business/domain errors extend this class.
 *
 * Usage:
 *   throw new AppError('Something went wrong', 500, 'INTERNAL_ERROR')
 *   throw new NotFoundError('Order', orderId)
 *   throw new UnauthorizedError('Token expired')
 */

import { ERROR_CODES } from "./error-codes";

interface AppErrorJson {
	success: false;
	error: {
		code: string;
		message: string;
		details?: Record<string, unknown>;
	};
}

export class AppError extends Error {
	public readonly statusCode: number;
	public readonly code: string;
	public readonly isOperational: boolean;
	public readonly details: Record<string, unknown>;

	constructor(
		message: string,
		statusCode: number = 500,
		code: string = "INTERNAL_ERROR",
		details: Record<string, unknown> = {},
	) {
		super(message);
		this.name = this.constructor.name;
		this.statusCode = statusCode;
		this.code = code;
		this.isOperational = true;
		this.details = details;

		Error.captureStackTrace(this, this.constructor);
	}

	toJSON(): AppErrorJson {
		const hasDetails = Object.keys(this.details).length > 0;
		return {
			success: false,
			error: {
				code: this.code,
				message: this.message,
				...(hasDetails && { details: this.details }),
			},
		};
	}
}

/** 400 — Bad Request */
export class BadRequestError extends AppError {
	constructor(
		message: string = "Bad request",
		code: string = ERROR_CODES.BAD_REQUEST,
		details: Record<string, unknown> = {},
	) {
		super(message, 400, code, details);
	}
}

/** 400 — Validation Error (Zod/schema failure) */
export class ValidationError extends AppError {
	constructor(message: string = "Validation failed", details: Record<string, unknown> = {}) {
		super(message, 400, ERROR_CODES.VALIDATION_ERROR, details);
	}
}

/** 401 — Unauthorized */
export class UnauthorizedError extends AppError {
	constructor(message: string = "Unauthorized") {
		super(message, 401, ERROR_CODES.UNAUTHORIZED);
	}
}

/** 403 — Forbidden */
export class ForbiddenError extends AppError {
	constructor(message: string = "Forbidden") {
		super(message, 403, ERROR_CODES.FORBIDDEN);
	}
}

/** 404 — Not Found */
export class NotFoundError extends AppError {
	constructor(resource: string = "Resource", id: string = "") {
		const message =
			id.length > 0 ? `${resource} with id '${id}' not found` : `${resource} not found`;
		super(message, 404, ERROR_CODES.NOT_FOUND);
	}
}

/** 409 — Conflict */
export class ConflictError extends AppError {
	constructor(message: string = "Resource already exists") {
		super(message, 409, ERROR_CODES.CONFLICT);
	}
}

/** 422 — Unprocessable Entity */
export class UnprocessableError extends AppError {
	constructor(
		message: string = "Unprocessable entity",
		code: string = ERROR_CODES.BUSINESS_RULE_VIOLATION,
	) {
		super(message, 422, code);
	}
}

/** 429 — Too Many Requests */
export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests") {
    super(message, 429, ERROR_CODES.RATE_LIMIT_EXCEEDED);
  }
}

/** 503 — Service Unavailable (database/connection failure) */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = "Service temporarily unavailable") {
    super(message, 503, "SERVICE_UNAVAILABLE");
  }
}

export { AppError as default };
