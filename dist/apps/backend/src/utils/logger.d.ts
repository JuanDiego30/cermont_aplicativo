import winston from 'winston';
import type { Request } from 'express';
import type { AppError } from './errorHandler.ts';
declare const levels: {
    readonly error: 0;
    readonly warn: 1;
    readonly info: 2;
    readonly http: 3;
    readonly debug: 4;
};
export type LogLevel = keyof typeof levels;
export declare const logger: winston.Logger;
export declare const morganStream: {
    write: (message: string) => void;
};
export declare const logError: (error: Error | AppError, context?: Record<string, unknown>) => void;
export declare const logUserAction: (userId: string, action: string, details?: Record<string, unknown>) => void;
export declare const logDatabaseOperation: (operation: string, model: string, details?: Record<string, unknown>) => void;
export declare const logHTTPRequest: (req: Request, details?: Record<string, unknown>) => void;
export declare const sanitizeLog: (meta: Record<string, unknown>) => Record<string, unknown>;
export default logger;
//# sourceMappingURL=logger.d.ts.map