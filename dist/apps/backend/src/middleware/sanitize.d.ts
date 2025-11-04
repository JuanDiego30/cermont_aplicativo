import type { TypedRequest } from '../types';
interface SanitizeOptions {
    trim?: boolean;
    escape?: boolean;
    maxLength?: number;
    allowHTML?: boolean;
}
export declare const sanitizeBody: (options?: SanitizeOptions) => (req: TypedRequest, res: any, next: any) => void;
export declare const sanitizeQuery: (options?: SanitizeOptions) => (req: TypedRequest, res: any, next: any) => void;
export declare const sanitizeParams: (options?: SanitizeOptions) => (req: TypedRequest, res: any, next: any) => void;
export declare const sanitizeAll: (options?: SanitizeOptions) => (req: TypedRequest, res: any, next: any) => void;
export declare const detectThreatsMiddleware: (req: TypedRequest, res: any, next: any) => void;
export declare const mongoSanitization: any;
export declare const xssClean: (req: TypedRequest, res: any, next: any) => void;
export declare const sanitizeEmail: (email: any) => string | null;
export declare const validateObjectId: (id: any) => boolean;
declare const _default: {
    sanitizeAll: (options?: SanitizeOptions) => (req: TypedRequest, res: any, next: any) => void;
    detectThreatsMiddleware: (req: TypedRequest, res: any, next: any) => void;
    mongoSanitization: any;
    xssClean: (req: TypedRequest, res: any, next: any) => void;
    sanitizeEmail: (email: any) => string | null;
    validateObjectId: (id: any) => boolean;
};
export default _default;
//# sourceMappingURL=sanitize.d.ts.map