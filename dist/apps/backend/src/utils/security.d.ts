import type { ParsedQs } from 'qs';
export declare function sanitizeQueryForCache(query: ParsedQs | Record<string, any>): Record<string, string | string[]>;
export declare function maskEmail(email: string): string;
export declare function sanitizeInput(input: string): string;
export declare function isValidObjectId(id: string): boolean;
export declare function generateSecureToken(length?: number): string;
export declare function isValidEmail(email: string): boolean;
export declare function sanitizeLogData(obj: any): any;
//# sourceMappingURL=security.d.ts.map