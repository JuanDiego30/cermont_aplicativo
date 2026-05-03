/**
 * Common Errors Module — Barrel Export
 *
 * NestJS-inspired error handling for Express 5.
 *
 * Usage:
 *   import { AppError, NotFoundError, ERROR_CODES } from '@/common/errors'
 */

export {
	AppError,
	BadRequestError,
	ConflictError,
	ForbiddenError,
	NotFoundError,
	RateLimitError,
	UnauthorizedError,
	UnprocessableError,
	ValidationError,
} from "./AppError";

export type { ErrorCode } from "./error-codes";
export { ERROR_CODES } from "./error-codes";
export { errorHandler } from "./error-handler";
