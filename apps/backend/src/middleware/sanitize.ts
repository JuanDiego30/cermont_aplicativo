import validator from 'validator';
import mongoSanitize from 'express-mongo-sanitize';
import xssLib from 'xss';
import { createAuditLog } from './auditLogger';
import { HTTP_STATUS } from '../utils/constants';
import { errorResponse } from '../utils/response';
import { logger } from '../utils/logger';
import type { TypedRequest } from '../types';

interface SanitizeOptions {
  trim?: boolean;
  escape?: boolean;
  maxLength?: number;
  allowHTML?: boolean;
}

const MAX_DEPTH = 10;
const MAX_STRING_LENGTH = 10000;
const STRICT_MODE = process.env.NODE_ENV === 'production';

/**
 * Sanitize string value
 */
const sanitizeString = (value: any, options: SanitizeOptions = {}): string | any => {
  if (typeof value !== 'string') return value;

  const { trim = true, escape = true, maxLength = MAX_STRING_LENGTH, allowHTML = false } = options;
  let sanitized = value;

  if (trim) sanitized = sanitized.trim();
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  if (allowHTML) {
    // Basic HTML sanitization - remove dangerous tags
    sanitized = sanitized.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    sanitized = sanitized.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  } else if (escape) {
    sanitized = validator.escape(sanitized);
  }

  return sanitized;
};

/**
 * Recursively sanitize object
 */
const sanitizeObject = (obj: any, options: SanitizeOptions = {}, depth = 0): any => {
  if (depth > MAX_DEPTH) return null;
  if (obj === null || typeof obj !== 'object') {
    return sanitizeString(obj, options);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options, depth + 1));
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const sanitizedKey = sanitizeString(key, { allowHTML: false, escape: false });
    if (sanitizedKey.includes('$') || sanitizedKey.includes('.')) continue; // Skip NoSQL operators

    sanitized[sanitizedKey] = typeof value === 'object' && value !== null
      ? sanitizeObject(value, options, depth + 1)
      : sanitizeString(value, options);
  }

  return sanitized;
};

/**
 * Detect dangerous patterns
 */
const detectThreats = (value: any): string[] | null => {
  if (typeof value !== 'string') return null;

  const threats: string[] = [];
  const patterns = {
    xss: /<script[^>]*>[\s\S]*?<\/script>|javascript:|on\w+\s*=/gi,
    sql: /(\bor\b|\band\b).*?['"=]/gi,
    path: /\.\.[\/\\]/g,
    command: /[;&|$()<>]/g
  };

  if (patterns.xss.test(value)) threats.push('XSS');
  if (patterns.sql.test(value)) threats.push('SQL_INJECTION');
  if (patterns.path.test(value)) threats.push('PATH_TRAVERSAL');
  if (patterns.command.test(value)) threats.push('COMMAND_INJECTION');

  return threats.length > 0 ? threats : null;
};

/**
 * Audit detected threats
 */
const auditThreat = async (req: TypedRequest, threats: string[], location: string, field: string): Promise<void> => {
  try {
    await createAuditLog({
      userId: req.user?.userId || undefined,
      userEmail: req.user?.email || 'anonymous',
      action: 'SECURITY_THREAT',
      resource: 'Sanitization',
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      endpoint: req.originalUrl || req.path,
      method: req.method,
      status: 'FAILURE',
      severity: 'HIGH',
    });
  } catch (error) {
    logger.error('Sanitization audit failed', { error });
  }
};

/**
 * Sanitize request body
 */
export const sanitizeBody = (options: SanitizeOptions = {}) => {
  return (req: TypedRequest, res: any, next: any) => {
    if (req.body && Object.keys(req.body).length > 0) {
      req.body = sanitizeObject(req.body, options);
    }
    next();
  };
};

/**
 * Sanitize query parameters
 */
export const sanitizeQuery = (options: SanitizeOptions = {}) => {
  return (req: TypedRequest, res: any, next: any) => {
    if (req.query && Object.keys(req.query).length > 0) {
      req.query = sanitizeObject(req.query, options);
    }
    next();
  };
};

/**
 * Sanitize route parameters
 */
export const sanitizeParams = (options: SanitizeOptions = {}) => {
  return (req: TypedRequest, res: any, next: any) => {
    if (req.params && Object.keys(req.params).length > 0) {
      req.params = sanitizeObject(req.params, { ...options, allowHTML: false });
    }
    next();
  };
};

/**
 * Full sanitization middleware
 */
export const sanitizeAll = (options: SanitizeOptions = {}) => {
  return (req: TypedRequest, res: any, next: any) => {
    sanitizeBody(options)(req, res, () => {});
    sanitizeQuery(options)(req, res, () => {});
    sanitizeParams(options)(req, res, () => {});
    next();
  };
};

/**
 * Threat detection middleware
 */
export const detectThreatsMiddleware = (req: TypedRequest, res: any, next: any) => {
  const checkObject = (obj: any, location: string, path = '') => {
    if (typeof obj === 'string') {
      const threats = detectThreats(obj);
      if (threats) {
        auditThreat(req, threats, location, path);
        if (STRICT_MODE) {
          return errorResponse(res, 'Malicious input detected', HTTP_STATUS.BAD_REQUEST);
        }
      }
    } else if (obj && typeof obj === 'object') {
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

/**
 * MongoDB sanitization middleware
 */
export const mongoSanitization = mongoSanitize({
  replaceWith: '_removed_',
  onSanitize: ({ req, key }: any) => {
    logger.warn('MongoDB operator removed', { path: req.path, key });
  }
});

/**
 * XSS cleaning middleware
 */
export const xssClean = (req: TypedRequest, res: any, next: any) => {
  if (req.body) req.body = xssLib(JSON.stringify(req.body));
  // Note: req.query sanitization removed as it expects ParsedQs, not string
  next();
};

/**
 * Validate email
 */
export const sanitizeEmail = (email: any): string | null => {
  if (!email || typeof email !== 'string') return null;
  const normalized = validator.normalizeEmail(email.toLowerCase().trim());
  if (normalized && validator.isEmail(normalized)) return normalized;
  return null;
};

/**
 * Validate ObjectId
 */
export const validateObjectId = (id: any): boolean => {
  return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
};

export const sanitizers = {
  string: sanitizeString,
  email: sanitizeEmail,
  filename: (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, '_')
};

export default {
  sanitizeAll,
  detectThreatsMiddleware,
  mongoSanitization,
  xssClean,
  sanitizeEmail,
  validateObjectId
};
