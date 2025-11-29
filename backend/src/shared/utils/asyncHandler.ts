import type { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async route handler to catch errors and pass them to Express error middleware.
 * Eliminates the need for try-catch blocks in every controller method.
 */
export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
