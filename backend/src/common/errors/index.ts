/**
 * Common Errors Module — Barrel Export
 *
 * NestJS-inspired error handling for Express.
 *
 * Usage:
 *   import { AppError, NotFoundError, ERROR_CODES } from '@/common/errors'
 */

// Error classes
export {
	AppError,
	BadRequestError,
	ConflictError,
	ForbiddenError,
	NotFoundError,
	PayloadTooLargeError,
	RateLimitError,
	ServiceUnavailableError,
	UnauthorizedError,
	UnprocessableError,
	UnsupportedMediaTypeError,
	ValidationError,
} from "./AppError";
export type { ErrorCode } from "./error-codes";
// Error codes registry
export { ERROR_CODES } from "./error-codes";

// Global error handler middleware
export { errorHandler } from "./error-handler";
