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

import type { JsonValue } from "../types/safe-types";
import { ERROR_CODES } from "./error-codes";

export class AppError extends Error {
	public readonly statusCode: number;
	public readonly code: string;
	public readonly isOperational: boolean;
	public readonly details?: JsonValue;

	constructor(
		message: string,
		statusCode: number = 500,
		code: string = "INTERNAL_ERROR",
		details?: JsonValue,
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
		const hasDetails = Object.hasOwn(this, "details");
		return {
			success: false,
			error: {
				code: this.code,
				message: this.message,
				...(hasDetails ? { details: this.details } : {}),
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
		details?: JsonValue,
	) {
		super(message, 400, code, details);
	}
}

/**
 * 413 — Payload Too Large
 * Uploaded payload exceeds the configured size limit
 */
export class PayloadTooLargeError extends AppError {
	constructor(message: string = "Payload too large", code: string = "PAYLOAD_TOO_LARGE") {
		super(message, 413, code);
	}
}

/**
 * 415 — Unsupported Media Type
 * Declared content type or binary signature is not accepted
 */
export class UnsupportedMediaTypeError extends AppError {
	constructor(message: string = "Unsupported media type", code: string = "UNSUPPORTED_MEDIA_TYPE") {
		super(message, 415, code);
	}
}

/**
 * 400 — Validation Error
 * Zod/Joi validation failed
 */
export class ValidationError extends AppError {
	constructor(message: string = "Validation failed", details?: JsonValue) {
		super(message, 400, ERROR_CODES.VALIDATION_FAILED, details);
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
	constructor(message: string = "Forbidden", code: string = ERROR_CODES.FORBIDDEN) {
		super(message, 403, code);
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

/**
 * 503 — Service Unavailable
 * Upstream/downstream dependency failure (MongoDB, AI, file storage, etc.)
 */
export class ServiceUnavailableError extends AppError {
	constructor(
		message: string = "Service temporarily unavailable",
		code: string = "SERVICE_UNAVAILABLE",
		details?: JsonValue,
	) {
		super(message, 503, code, details);
	}
}
