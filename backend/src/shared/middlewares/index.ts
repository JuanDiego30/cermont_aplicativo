/**
 * ========================================
 * MIDDLEWARES BARREL EXPORT
 * ========================================
 * Exportaci�n centralizada de todos los middlewares del sistema.
 */

// Authentication & Authorization
export { authenticate, authenticateOptional } from './authenticate.js';
export { authorize, authorizeAll, authorizeOwner } from './authorize.js';

// Error Handling
export { errorHandler, createError, asyncHandler } from './errorHandler.js';
export { notFound } from './notFound.js';

// Validation
export { validateMiddleware } from './validateMiddleware.js';

// Auditing
export { auditMiddleware } from './auditMiddleware.js';

// Rate Limiting
export { adaptiveRateLimit, strictRateLimit } from './adaptiveRateLimit.js';

// Metrics
export { metricsMiddleware } from './metricsMiddleware.js';
