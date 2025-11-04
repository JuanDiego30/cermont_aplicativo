import type { Request } from 'express';
export type HashType = 'argon2' | 'bcrypt' | 'unknown';
export declare const validatePasswordStrength: (password: string) => boolean;
export declare const hashPassword: (password: string) => Promise<string>;
export declare const verifyPassword: (hash: string, password: string) => Promise<boolean>;
export declare const detectHashType: (hash: string) => HashType;
export declare const migratePasswordHash: (user: any, password: string, req?: Request) => Promise<void>;
export declare const generateTempPassword: (length?: number) => string;
declare const _default: {
    hashPassword: (password: string) => Promise<string>;
    verifyPassword: (hash: string, password: string) => Promise<boolean>;
    detectHashType: (hash: string) => HashType;
    validatePasswordStrength: (password: string) => boolean;
    migratePasswordHash: (user: any, password: string, req?: Request) => Promise<void>;
    generateTempPassword: (length?: number) => string;
};
export default _default;
//# sourceMappingURL=passwordHash.d.ts.map