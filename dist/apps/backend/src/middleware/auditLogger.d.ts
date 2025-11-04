import type { AuditLogData } from '../types/index.js';
export declare const createAuditLog: (data: AuditLogData) => Promise<void>;
export declare const logLoginFailed: (email: string, ipAddress: string, userAgent: string, reason: string) => Promise<void>;
//# sourceMappingURL=auditLogger.d.ts.map