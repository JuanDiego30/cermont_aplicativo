import winston from 'winston';
import path from 'path';
import { promises as fs } from 'fs';
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};
winston.addColors(colors);
const consoleFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.colorize({ all: true }), winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    return Object.keys(meta).length > 0 ? `${msg} ${JSON.stringify(meta, null, 2)}` : msg;
}));
const fileFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.uncolorize(), winston.format.json());
const getLevel = () => {
    const envLevel = process.env.LOG_LEVEL;
    const validLevels = ['error', 'warn', 'info', 'http', 'debug'];
    if (envLevel && validLevels.includes(envLevel)) {
        return envLevel;
    }
    return process.env.NODE_ENV === 'development' ? 'debug' : 'info';
};
const createTransports = () => {
    const transports = [
        new winston.transports.Console({
            level: 'http',
            format: consoleFormat,
        }),
    ];
    const logDir = path.join(process.cwd(), 'logs');
    transports.push(new winston.transports.File({
        filename: path.join(logDir, 'all.log'),
        format: fileFormat,
        maxsize: 10485760,
        maxFiles: 5,
        tailable: true,
        zippedArchive: true,
    }), new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        format: fileFormat,
        maxsize: 10485760,
        maxFiles: 5,
        tailable: true,
        zippedArchive: true,
    }));
    return transports;
};
const ensureLogDir = async () => {
    const logDir = path.join(process.cwd(), 'logs');
    try {
        await fs.mkdir(logDir, { recursive: true });
    }
    catch (err) {
        if (err.code !== 'EEXIST') {
            console.error('Failed to create logs directory:', err);
        }
    }
};
export const logger = winston.createLogger({
    level: getLevel(),
    levels,
    format: winston.format.errors({ stack: true }),
    transports: createTransports(),
    exitOnError: false,
    handleExceptions: true,
    handleRejections: true,
});
export const morganStream = {
    write: (message) => {
        logger.http(message.trim());
    },
};
await ensureLogDir();
logger.info('Logger inicializado correctamente', {
    level: getLevel(),
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
});
export const logError = (error, context = {}) => {
    const errObj = error instanceof Error ? { message: error.message, stack: error.stack, name: error.name } : { message: String(error) };
    logger.error('Error occurred', {
        ...context,
        error: errObj,
        timestamp: new Date().toISOString(),
    });
};
export const logUserAction = (userId, action, details = {}) => {
    logger.info('User action', {
        userId,
        action,
        timestamp: new Date().toISOString(),
        ...details,
    });
};
export const logDatabaseOperation = (operation, model, details = {}) => {
    logger.debug('Database operation', {
        operation,
        model,
        timestamp: new Date().toISOString(),
        ...details,
    });
};
export const logHTTPRequest = (req, details = {}) => {
    logger.http('HTTP Request', {
        method: req.method,
        url: req.url,
        ip: req.ip ? req.ip.replace(/::ffff:/, '') : 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        userId: req.user?._id?.toString() || 'anonymous',
        referer: req.get('Referer') || undefined,
        timestamp: new Date().toISOString(),
        ...details,
    });
};
export const sanitizeLog = (meta) => {
    const sensitiveKeys = ['password', 'token', 'secret', 'email', 'cccd', 'phone'];
    const sanitized = { ...meta };
    Object.keys(sanitized).forEach((key) => {
        if (sensitiveKeys.includes(key.toLowerCase())) {
            sanitized[key] = '[REDACTED]';
        }
        else if (typeof sanitized[key] === 'string' && key.toLowerCase().includes('email')) {
            sanitized[key] = sanitized[key].replace(/[\w\.-]+@[\w\.-]+/g, '***@***');
        }
        else if (typeof sanitized[key] === 'string' && key.toLowerCase().includes('phone')) {
            sanitized[key] = sanitized[key].replace(/\d/g, '*');
        }
        if (typeof sanitized[key] === 'object' && Object.keys(sanitized[key]).length > 20) {
            sanitized[key] = '[TRUNCATED]';
        }
    });
    return sanitized;
};
export default logger;
//# sourceMappingURL=logger.js.map