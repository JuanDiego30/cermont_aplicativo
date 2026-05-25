/**
 * AppError — Base Application Error Class
 *
 * NestJS-inspired error hierarchy for Express.
 * All business/domain errors extend this class.
 *
 * Usage:
 *   throw new AppError('Something went wrong', 500, 'INTERNAL_ERROR')
 *   throw new NotFoundError('Order', orderId)
 *   throw new UnauthorizedError('Token expired')
 */

import { ERROR_CODES } from "./error-codes";

export class AppError extends Error {
	public readonly statusCode: number;
	public readonly code: string;
	public readonly isOperational: boolean;
	public readonly details?: unknown;

	constructor(
		message: string,
		statusCode: number = 500,
		code: string = "INTERNAL_ERROR",
		details?: unknown,
	) {
		super(message);
		this.name = this.constructor.name;
		this.statusCode = statusCode;
		this.code = code;
		this.isOperational = true; // For identification of trusted vs untrusted errors
		this.details = details;

		Error.captureStackTrace(this, this.constructor);
	}

	/**
	 * Standard JSON representation for API responses
	 */
	toJSON() {
		return {
			success: false,
			error: {
				code: this.code,
				message: this.message,
				...(this.details !== undefined && { details: this.details }),
			},
		};
	}
}

/**
 * 400 — Bad Request
 * Request malformed, missing required fields, invalid data
 */
export class BadRequestError extends AppError {
	constructor(
		message: string = "Bad request",
		code: string = ERROR_CODES.BAD_REQUEST,
		details?: unknown,
	) {
		super(message, 400, code, details);
	}
}

/**
 * 400 — Validation Error
 * Zod/Joi validation failed
 */
export class ValidationError extends AppError {
	constructor(message: string = "Validation failed", details?: unknown) {
		super(message, 400, ERROR_CODES.VALIDATION_ERROR, details);
	}
}

/**
 * 401 — Unauthorized
 * Missing or invalid authentication token
 */
export class UnauthorizedError extends AppError {
	constructor(message: string = "Unauthorized") {
		super(message, 401, ERROR_CODES.UNAUTHORIZED);
	}
}

/**
 * 403 — Forbidden
 * Authenticated but insufficient permissions
 */
export class ForbiddenError extends AppError {
	constructor(message: string = "Forbidden") {
		super(message, 403, ERROR_CODES.FORBIDDEN);
	}
}

/**
 * 404 — Not Found
 * Resource does not exist
 */
export class NotFoundError extends AppError {
	constructor(resource: string = "Resource", id?: string) {
		const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`;
		super(message, 404, ERROR_CODES.NOT_FOUND);
	}
}

/**
 * 409 — Conflict
 * Resource already exists or state conflict
 */
export class ConflictError extends AppError {
	constructor(message: string = "Resource already exists") {
		super(message, 409, ERROR_CODES.CONFLICT);
	}
}

/**
 * 422 — Unprocessable Entity
 * Business rule violation (valid data but cannot process)
 */
export class UnprocessableError extends AppError {
	constructor(
		message: string = "Unprocessable entity",
		code: string = ERROR_CODES.BUSINESS_RULE_VIOLATION,
	) {
		super(message, 422, code);
	}
}

/**
 * 429 — Too Many Requests
 * Rate limit exceeded
 */
export class RateLimitError extends AppError {
	constructor(message: string = "Too many requests") {
		super(message, 429, ERROR_CODES.RATE_LIMIT_EXCEEDED);
	}
}
