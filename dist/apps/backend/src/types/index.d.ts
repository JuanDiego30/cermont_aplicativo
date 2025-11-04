import { Request } from 'express';
export interface AuthUser {
    userId: string;
    role: string;
    tokenVersion?: number;
    email?: string;
}
export interface TypedRequest<TBody = any> extends Request {
    body: TBody;
    user?: AuthUser;
}
export interface DeviceInfo {
    device: 'desktop' | 'mobile' | 'tablet';
    ip: string;
    userAgent: string;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    expiresAt: Date;
}
export interface AuditLogData {
    userId?: string;
    userEmail?: string;
    userRol?: string;
    action: string;
    resource: string;
    resourceId?: string;
    ipAddress: string;
    userAgent: string;
    method: string;
    endpoint: string;
    status: 'SUCCESS' | 'FAILURE';
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    details?: Record<string, any>;
    errorMessage?: string;
}
//# sourceMappingURL=index.d.ts.map