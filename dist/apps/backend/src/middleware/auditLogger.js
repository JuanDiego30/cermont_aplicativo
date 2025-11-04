import { Types } from 'mongoose';
import AuditLog from '../models/AuditLog.js';
import { logger } from '../utils/logger.js';
export const createAuditLog = async (data) => {
    try {
        const logData = {
            ...data,
            timestamp: new Date(),
            userId: typeof data.userId === 'string' ? new Types.ObjectId(data.userId) : data.userId,
        };
        await AuditLog.create(logData);
    }
    catch (error) {
        logger.error('[AuditLog] Error saving log:', {
            error: error.message,
            action: data.action,
            resource: data.resource,
        });
    }
};
export const logLoginFailed = async (email, ipAddress, userAgent, reason) => {
    await createAuditLog({
        userId: undefined,
        userEmail: email || 'unknown',
        action: 'LOGIN_FAILED',
        resource: 'Auth',
        ipAddress: ipAddress || 'unknown',
        userAgent: userAgent || 'unknown',
        method: 'POST',
        endpoint: '/api/v1/auth/login',
        status: 'FAILURE',
        severity: 'MEDIUM',
        description: `Login fallido para ${email || 'unknown'}: ${reason}`,
    });
};
//# sourceMappingURL=auditLogger.js.map