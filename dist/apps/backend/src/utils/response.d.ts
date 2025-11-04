import { Response } from 'express';
import { AppError } from './errorHandler';
import type { CursorPaginationMetadata, OffsetPaginationMetadata } from './pagination';
export interface SuccessResponse<T = unknown> {
    success: true;
    message: string;
    data?: T;
    timestamp: string;
    pagination?: CursorPaginationMetadata | OffsetPaginationMetadata;
    meta?: Record<string, unknown>;
}
export interface ErrorDetails {
    field?: string;
    message: string;
    value?: unknown;
    type?: string;
    code?: string;
}
export interface ErrorResponse {
    success: false;
    message: string;
    timestamp: string;
    errorCode?: string;
    error: {
        message?: string;
        code?: string | null;
        details?: ErrorDetails[];
    };
    stack?: string;
}
export type ResponseShape = SuccessResponse | ErrorResponse;
export declare const successResponse: <T>(res: Response, data?: T | null, message?: string, statusCode?: number, meta?: {
    pagination?: any;
    [key: string]: unknown;
}) => Response;
export declare const errorResponse: (res: Response, message?: string, statusCode?: number, details?: ErrorDetails[], code?: string | null) => Response;
export declare const validationErrorResponse: (res: Response, details?: ErrorDetails[]) => Response;
export declare const notFoundResponse: (res: Response, resource?: string) => Response;
export declare const unauthorizedResponse: (res: Response, message?: string) => Response;
export declare const forbiddenResponse: (res: Response, message?: string) => Response;
export declare const conflictResponse: (res: Response, message?: string) => Response;
export declare const rateLimitResponse: (res: Response, retryAfter?: number) => Response;
export declare const createdResponse: (res: Response, data: unknown, message?: string) => Response;
export declare const noContentResponse: (res: Response) => Response;
export declare const paginatedResponse: <T>(res: Response, data: T[], pagination: CursorPaginationMetadata | OffsetPaginationMetadata, message?: string) => Response;
export declare const formatMongooseErrors: (error: any) => ErrorDetails[];
export declare const formatJoiErrors: (error: any) => ErrorDetails[];
export declare const formatAppError: (appError: AppError) => ErrorDetails[];
declare const _default: {
    successResponse: <T>(res: Response, data?: T | null, message?: string, statusCode?: number, meta?: {
        pagination?: any;
        [key: string]: unknown;
    }) => Response;
    errorResponse: (res: Response, message?: string, statusCode?: number, details?: ErrorDetails[], code?: string | null) => Response;
    validationErrorResponse: (res: Response, details?: ErrorDetails[]) => Response;
    notFoundResponse: (res: Response, resource?: string) => Response;
    unauthorizedResponse: (res: Response, message?: string) => Response;
    forbiddenResponse: (res: Response, message?: string) => Response;
    conflictResponse: (res: Response, message?: string) => Response;
    rateLimitResponse: (res: Response, retryAfter?: number) => Response;
    createdResponse: (res: Response, data: unknown, message?: string) => Response;
    noContentResponse: (res: Response) => Response;
    paginatedResponse: <T>(res: Response, data: T[], pagination: CursorPaginationMetadata | OffsetPaginationMetadata, message?: string) => Response;
    formatMongooseErrors: (error: any) => ErrorDetails[];
    formatJoiErrors: (error: any) => ErrorDetails[];
    formatAppError: (appError: AppError) => ErrorDetails[];
};
export default _default;
//# sourceMappingURL=response.d.ts.map