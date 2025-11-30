/**
 * Shared Utilities
 * 
 * Re-exports all utility functions from a single entry point.
 */

// Logger
export { logger } from './logger.js';

// Async Handler for route wrappers
export { asyncHandler } from './asyncHandler.js';

// Error handling utilities
export {
  getErrorMessage,
  getErrorStack,
  hasErrorProperty,
  wrapError,
  logUnknownError,
  rethrowWithLogging,
  handleErrorWithDefault,
  isPrismaError,
  isHttpError,
  getHttpStatusFromError,
} from './catchUtils.js';

// API Response helpers
export {
  apiResponse,
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendPaginated,
  sendBadRequest,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendConflict,
  sendUnprocessable,
  sendInternalError,
  createProblemDetails,
  type ProblemDetails,
  type SuccessResponse,
  type PaginatedResponse,
} from './apiResponse.js';

// ID Generation
export { generateUniqueId } from './generateUniqueId.js';
