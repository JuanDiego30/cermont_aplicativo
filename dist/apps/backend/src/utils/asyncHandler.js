import { logger } from './logger.js';
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            const err = error instanceof Error ? error : new Error(String(error));
            logger.error('Error en asyncHandler:', {
                error: err.message,
                stack: err.stack,
                path: req.path,
                method: req.method,
                userId: req.user?.userId || 'anonymous',
            });
            next(err);
        });
    };
};
//# sourceMappingURL=asyncHandler.js.map