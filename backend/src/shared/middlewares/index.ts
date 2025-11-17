/**
 * ========================================
 * MIDDLEWARES BARREL EXPORT
 * ========================================
 * Exportación centralizada de todos los middlewares del sistema.
 */

// Authentication & Authorization
export { authenticate, authenticateOptional } from './authenticate';
export { authorize, authorizeAll, authorizeOwner } from './authorize';

// Error Handling
export { errorHandler, createError, asyncHandler } from './errorHandler';
export { notFound } from './notFound';

// Validation
export { validateMiddleware } from './validateMiddleware';

// Auditing
export { auditMiddleware } from './auditMiddleware';

// Rate Limiting
export { adaptiveRateLimit, strictRateLimit } from './adaptiveRateLimit';

// Metrics
export { metricsMiddleware } from './metricsMiddleware';
