/**
 * ARCHIVO: logger.service.ts
 * FUNCION: Servicio de logging empresarial con Winston (JSON estructurado)
 * IMPLEMENTACION: Singleton pattern + rotación de archivos + console en dev
 * DEPENDENCIAS: winston, path (Node.js)
 * EXPORTS: LoggerService, ContextualLogger, LogLevel, LogContext, logger
 */
import * as winston from 'winston';
import * as path from 'path';

export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
}

export interface LogContext {
    requestId?: string;
    userId?: string;
    [key: string]: unknown;
}

// Create logs directory path
const logsDir = path.join(process.cwd(), 'logs');

// Configure Winston
const winstonLogger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'cermont-api' },
    transports: [
        // Error log file
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Combined log file
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
    ],
});

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
    winstonLogger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ level, message, timestamp, context, ...meta }) => {
                    const ctx = context ? `[${context}]` : '';
                    const metaStr = Object.keys(meta).length > 2 ? ` ${JSON.stringify(meta)}` : '';
                    return `${timestamp} ${level} ${ctx} ${message}${metaStr}`;
                })
            ),
        })
    );
}

export class LoggerService {
    private static instance: LoggerService;

    private constructor() { }

    public static getInstance(): LoggerService {
        if (!LoggerService.instance) {
            LoggerService.instance = new LoggerService();
        }
        return LoggerService.instance;
    }

    public debug(context: string, message: string, meta?: LogContext): void {
        winstonLogger.debug(message, { context, ...meta });
    }

    public info(context: string, message: string, meta?: LogContext): void {
        winstonLogger.info(message, { context, ...meta });
    }

    public warn(context: string, message: string, meta?: LogContext): void {
        winstonLogger.warn(message, { context, ...meta });
    }

    public error(context: string, message: string, meta?: LogContext & { error?: Error }): void {
        winstonLogger.error(message, { context, ...meta });
    }

    /**
     * Create a child logger with preset context
     */
    public withContext(context: string): ContextualLogger {
        return new ContextualLogger(context);
    }
}

/**
 * Contextual logger for specific services
 */
export class ContextualLogger {
    constructor(private readonly context: string) { }

    debug(message: string, meta?: LogContext): void {
        winstonLogger.debug(message, { context: this.context, ...meta });
    }

    info(message: string, meta?: LogContext): void {
        winstonLogger.info(message, { context: this.context, ...meta });
    }

    warn(message: string, meta?: LogContext): void {
        winstonLogger.warn(message, { context: this.context, ...meta });
    }

    error(message: string, meta?: LogContext & { error?: Error }): void {
        winstonLogger.error(message, { context: this.context, ...meta });
    }
}

// Export singleton instance
export const logger = LoggerService.getInstance();
