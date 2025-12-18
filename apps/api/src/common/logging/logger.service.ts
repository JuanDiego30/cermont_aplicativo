/**
 * @file logger.service.ts
 * @description Servicio de logging centralizado con Winston
 * 
 * Características:
 * - Formato estructurado JSON para producción
 * - Formato legible para desarrollo
 * - Transports a consola y archivos
 * - Métodos semánticos (info, error, warn, debug, audit, performance)
 */

import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import * as path from 'path';

/**
 * Servicio de logging centralizado
 * Reemplaza console.log en toda la aplicación
 */
@Injectable()
export class LoggerService {
    private logger: winston.Logger;

    constructor() {
        const isProduction = process.env.NODE_ENV === 'production';
        const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');
        const logsDir = path.join(process.cwd(), 'logs');

        this.logger = winston.createLogger({
            level: logLevel,
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.errors({ stack: true }),
                isProduction
                    ? winston.format.json()
                    : winston.format.combine(
                        winston.format.colorize(),
                        winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
                            const metaStr = Object.keys(meta).length
                                ? `\n${JSON.stringify(meta, null, 2)}`
                                : '';
                            const ctxStr = context ? `[${context}] ` : '';
                            return `${timestamp} ${level} ${ctxStr}${message}${metaStr}`;
                        }),
                    ),
            ),
            defaultMeta: {
                service: 'cermont-api',
                version: process.env.npm_package_version || '1.0.0',
                environment: process.env.NODE_ENV || 'development',
            },
            transports: [
                // Console transport
                new winston.transports.Console({
                    level: logLevel,
                }),

                // Error log file
                new winston.transports.File({
                    filename: path.join(logsDir, 'error.log'),
                    level: 'error',
                    maxsize: 10 * 1024 * 1024, // 10MB
                    maxFiles: 5,
                }),

                // Combined log file
                new winston.transports.File({
                    filename: path.join(logsDir, 'combined.log'),
                    maxsize: 10 * 1024 * 1024, // 10MB
                    maxFiles: 10,
                }),
            ],
        });
    }

    /**
     * Log de información general
     */
    info(message: string, context?: string, meta?: Record<string, unknown>): void {
        this.logger.info(message, { context, ...meta });
    }

    /**
     * Log de error con stack trace
     */
    error(
        message: string,
        error?: Error | string,
        context?: string,
        meta?: Record<string, unknown>,
    ): void {
        const errorMeta =
            error instanceof Error
                ? {
                    errorName: error.name,
                    errorMessage: error.message,
                    stack: error.stack,
                }
                : { errorMessage: error };

        this.logger.error(message, { context, ...errorMeta, ...meta });
    }

    /**
     * Log de advertencia
     */
    warn(message: string, context?: string, meta?: Record<string, unknown>): void {
        this.logger.warn(message, { context, ...meta });
    }

    /**
     * Log de debug (solo en desarrollo)
     */
    debug(message: string, context?: string, meta?: Record<string, unknown>): void {
        this.logger.debug(message, { context, ...meta });
    }

    /**
     * Log de verbose (más detallado que debug)
     */
    verbose(message: string, context?: string, meta?: Record<string, unknown>): void {
        this.logger.verbose(message, { context, ...meta });
    }

    /**
     * Log de auditoría para acciones importantes
     * Usar para: login, cambios de datos, acciones administrativas
     */
    audit(
        action: string,
        userId: string,
        resource: string,
        details?: Record<string, unknown>,
    ): void {
        this.logger.info(`AUDIT: ${action}`, {
            context: 'AUDIT',
            action,
            userId,
            resource,
            timestamp: new Date().toISOString(),
            ...details,
        });
    }

    /**
     * Log de performance para medir tiempos
     * Advierte si duration > threshold
     */
    performance(
        label: string,
        durationMs: number,
        threshold: number = 1000,
        meta?: Record<string, unknown>,
    ): void {
        const level = durationMs > threshold ? 'warn' : 'info';
        this.logger[level](`PERF: ${label} - ${durationMs}ms`, {
            context: 'PERFORMANCE',
            label,
            durationMs,
            threshold,
            slow: durationMs > threshold,
            ...meta,
        });
    }

    /**
     * Log de request HTTP
     */
    http(
        method: string,
        url: string,
        statusCode: number,
        durationMs: number,
        userId?: string,
    ): void {
        const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
        this.logger[level](`${method} ${url} ${statusCode} - ${durationMs}ms`, {
            context: 'HTTP',
            method,
            url,
            statusCode,
            durationMs,
            userId,
        });
    }

    /**
     * Log de API request (alias para compatibilidad con interceptor)
     */
    logApiRequest(
        method: string,
        url: string,
        statusCode: number,
        durationMs: number,
        userId?: string,
        meta?: Record<string, unknown>,
    ): void {
        const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
        this.logger[level](`${method} ${url} ${statusCode} - ${durationMs}ms`, {
            context: 'HTTP',
            method,
            url,
            statusCode,
            durationMs,
            userId,
            ...meta,
        });
    }

    /**
     * Log de error con stack trace completo
     */
    logErrorWithStack(
        error: Error,
        context: string,
        meta?: Record<string, unknown>,
    ): void {
        this.logger.error(error.message, {
            context,
            errorName: error.name,
            stack: error.stack,
            ...meta,
        });
    }
}
