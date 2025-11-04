import { Request, Response, NextFunction } from 'express';
import type { HttpStatus } from './constants.ts';
import type { ErrorCode } from './constants.ts';
export interface AppErrorDetails {
    code?: ErrorCode;
    [key: string]: any;
}
export interface AppErrorResponse {
    success: false;
    error: {
        message: string;
        code: ErrorCode;
        status: 'fail' | 'error';
        details?: AppErrorDetails;
        stack?: string;
    };
}
export declare class AppError extends Error {
    readonly statusCode: HttpStatus;
    readonly code: ErrorCode;
    readonly isOperational: boolean;
    readonly status: 'fail' | 'error';
    readonly details?: AppErrorDetails;
    constructor(message: string, statusCode?: HttpStatus, details?: AppErrorDetails, isOperational?: boolean);
}
export declare const errorHandler: (err: Error | AppError, req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map