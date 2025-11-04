import validator from 'validator';
import mongoSanitize from 'express-mongo-sanitize';
import * as xssLib from 'xss';
import { createAuditLog } from './auditLogger';
import { HTTP_STATUS } from '../utils/constants';
import { errorResponse } from '../utils/response';
import { logger } from '../utils/logger';
const MAX_DEPTH = 10;
const MAX_STRING_LENGTH = 10000;
const STRICT_MODE = process.env.NODE_ENV === 'production';
const sanitizeString = (value, options = {}) => {
    if (typeof value !== 'string')
        return value;
    const { trim = true, escape = true, maxLength = MAX_STRING_LENGTH, allowHTML = false } = options;
    let sanitized = value;
    if (trim)
        sanitized = sanitized.trim();
    if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }
    if (allowHTML) {
        sanitized = sanitized.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
        sanitized = sanitized.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');
        sanitized = sanitized.replace(/javascript:/gi, '');
        sanitized = sanitized.replace(/on\w+\s*=/gi, '');
    }
    else if (escape) {
        sanitized = validator.escape(sanitized);
    }
    return sanitized;
};
const sanitizeObject = (obj, options = {}, depth = 0) => {
    if (depth > MAX_DEPTH)
        return null;
    if (obj === null || typeof obj !== 'object') {
        return sanitizeString(obj, options);
    }
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item, options, depth + 1));
    }
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = sanitizeString(key, { allowHTML: false, escape: false });
        if (sanitizedKey.includes('$') || sanitizedKey.includes('.'))
            continue;
        sanitized[sanitizedKey] = typeof value === 'object' && value !== null
            ? sanitizeObject(value, options, depth + 1)
            : sanitizeString(value, options);
    }
    return sanitized;
};
const detectThreats = (value) => {
    if (typeof value !== 'string')
        return null;
    const threats = [];
    const patterns = {
        xss: /<script[^>]*>[\s\S]*?<\/script>|javascript:|on\w+\s*=/gi,
        sql: /(\bor\b|\band\b).*?['"=]/gi,
        path: /\.\.[\/\\]/g,
        command: /[;&|$()<>]/g
    };
    if (patterns.xss.test(value))
        threats.push('XSS');
    if (patterns.sql.test(value))
        threats.push('SQL_INJECTION');
    if (patterns.path.test(value))
        threats.push('PATH_TRAVERSAL');
    if (patterns.command.test(value))
        threats.push('COMMAND_INJECTION');
    return threats.length > 0 ? threats : null;
};
const auditThreat = async (req, threats, location, field) => {
    try {
        await createAuditLog({
            userId: req.user?.userId || null,
            userEmail: req.user?.email || 'anonymous',
            action: 'SECURITY_THREAT',
            resource: 'Sanitization',
            ipAddress: req.ip || 'unknown',
            userAgent: req.get('User-Agent') || 'unknown',
            endpoint: req.originalUrl || req.path,
            method: req.method,
            status: 'DETECTED',
            severity: 'HIGH',
            description: `Input threat detected: ${threats.join(', ')}`,
            metadata: { location, field, threats }
        });
    }
    catch (error) {
        logger.error('Sanitization audit failed', { error });
    }
};
export const sanitizeBody = (options = {}) => {
    return (req, res, next) => {
        if (req.body && Object.keys(req.body).length > 0) {
            req.body = sanitizeObject(req.body, options);
        }
        next();
    };
};
export const sanitizeQuery = (options = {}) => {
    return (req, res, next) => {
        if (req.query && Object.keys(req.query).length > 0) {
            req.query = sanitizeObject(req.query, options);
        }
        next();
    };
};
export const sanitizeParams = (options = {}) => {
    return (req, res, next) => {
        if (req.params && Object.keys(req.params).length > 0) {
            req.params = sanitizeObject(req.params, { ...options, allowHTML: false });
        }
        next();
    };
};
export const sanitizeAll = (options = {}) => {
    return (req, res, next) => {
        sanitizeBody(options)(req, res, () => { });
        sanitizeQuery(options)(req, res, () => { });
        sanitizeParams(options)(req, res, () => { });
        next();
    };
};
export const detectThreatsMiddleware = (req, res, next) => {
    const checkObject = (obj, location, path = '') => {
        if (typeof obj === 'string') {
            const threats = detectThreats(obj);
            if (threats) {
                auditThreat(req, threats, location, path);
                if (STRICT_MODE) {
                    return errorResponse(res, 'Malicious input detected', HTTP_STATUS.BAD_REQUEST);
                }
            }
        }
        else if (obj && typeof obj === 'object') {
            Object.entries(obj).forEach(([key, value]) => {
                checkObject(value, location, path ? `${path}.${key}` : key);
            });
        }
    };
    checkObject(req.body, 'body');
    checkObject(req.query, 'query');
    checkObject(req.params, 'params');
    next();
};
export const mongoSanitization = mongoSanitize({
    replaceWith: '_removed_',
    onSanitize: ({ req, key }) => {
        logger.warn('MongoDB operator removed', { path: req.path, key });
    }
});
export const xssClean = (req, res, next) => {
    if (req.body)
        req.body = xssLib.process(req.body);
    if (req.query)
        req.query = xssLib.process(req.query);
    next();
};
export const sanitizeEmail = (email) => {
    if (!email || typeof email !== 'string')
        return null;
    const normalized = validator.normalizeEmail(email.toLowerCase().trim());
    return validator.isEmail(normalized || '') ? normalized : null;
};
export const validateObjectId = (id) => {
    return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
};
export default {
    sanitizeAll,
    detectThreatsMiddleware,
    mongoSanitization,
    xssClean,
    sanitizeEmail,
    validateObjectId
};
//# sourceMappingURL=sanitize.js.map