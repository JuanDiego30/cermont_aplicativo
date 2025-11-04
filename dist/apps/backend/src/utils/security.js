export function sanitizeQueryForCache(query) {
    const sanitized = {};
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null) {
            continue;
        }
        if (Array.isArray(value)) {
            sanitized[key] = value
                .filter((v) => v !== undefined && v !== null)
                .map((v) => String(v));
        }
        else if (typeof value === 'object') {
            sanitized[key] = JSON.stringify(value);
        }
        else {
            sanitized[key] = String(value);
        }
    }
    return sanitized;
}
export function maskEmail(email) {
    if (!email || !email.includes('@')) {
        return '***@***.***';
    }
    const [local, domain] = email.split('@');
    const maskedLocal = local.length > 2 ? local.substring(0, 2) + '****' : '***';
    return `${maskedLocal}@${domain}`;
}
export function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return '';
    }
    return input
        .trim()
        .replace(/[<>]/g, '')
        .substring(0, 1000);
}
export function isValidObjectId(id) {
    return /^[0-9a-fA-F]{24}$/.test(id);
}
export function generateSecureToken(length = 32) {
    const crypto = require('crypto');
    return crypto.randomBytes(length).toString('hex');
}
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
export function sanitizeLogData(obj) {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }
    const clean = { ...obj };
    const sensitiveFields = ['password', 'refreshToken', 'accessToken', 'token', 'secret', 'key'];
    sensitiveFields.forEach(field => {
        if (clean[field]) {
            delete clean[field];
        }
    });
    if (clean.email && typeof clean.email === 'string') {
        clean.email = maskEmail(clean.email);
    }
    Object.keys(clean).forEach(key => {
        if (typeof clean[key] === 'object' && clean[key] !== null) {
            clean[key] = sanitizeLogData(clean[key]);
        }
    });
    return clean;
}
//# sourceMappingURL=security.js.map