import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { logger } from './logger.js';

type AsyncHandlerFn = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Wrapper para funciones async en Express
 * Captura errores automáticamente y los pasa al middleware de error
 * @param fn - Función async a ejecutar
 * @returns Función wrapped
 */
export const asyncHandler = (fn: AsyncHandlerFn): ((req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch((error: unknown) => {
      const err = error instanceof Error ? error : new Error(String(error));

      logger.error('Error en asyncHandler:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        userId: (req as any).user?.userId || 'anonymous',
      });

      next(err);
    });
  };
};

// Multer configuration for file uploads
const storage = multer.memoryStorage(); // Store files in memory for processing

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: Request, file, cb) => {
    // Allow common file types
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

export const uploadFields = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'files', maxCount: 10 },
]);

// Rate limiter for uploads (placeholder)
export const uploadRateLimiter = (options: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Implement rate limiting logic here
    next();
  };
};

// Audit logger for uploads (placeholder)
export const auditLogger = (action: string, resource: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Implement audit logging here
    next();
  };
};

// Sanitize params (placeholder)
export const sanitizeParams = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Implement parameter sanitization here
    next();
  };
};
