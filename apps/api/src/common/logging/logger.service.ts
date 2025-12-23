/**
 * @file logger.service.ts
 * @description Servicio de logging centralizado usando Logger nativo de NestJS
 * 
 * Características:
 * - Logger nativo de NestJS (sin dependencias externas)
 * - Formato estructurado para producción
 * - Métodos semánticos (info, error, warn, debug, audit, performance)
 * - Compatible con el Logger de @nestjs/common
 */

import { Injectable, Logger } from '@nestjs/common';

/**
 * Servicio de logging centralizado
 * Usa Logger nativo de NestJS - Sin dependencias externas
 */
@Injectable()
export class LoggerService {
    private readonly logger: Logger;

    constructor() {
        this.logger = new Logger('CermontAPI');
    }

    /**
     * Log de información general
     */
    info(message: string, context?: string, meta?: Record<string, unknown>): void {
        const contextStr = context ? `[${context}] ` : '';
        const metaStr = meta && Object.keys(meta).length > 0 
            ? ` ${JSON.stringify(meta)}` 
            : '';
        this.logger.log(`${contextStr}${message}${metaStr}`);
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
        const contextStr = context ? `[${context}] ` : '';
        if (error instanceof Error) {
            this.logger.error(
                `${contextStr}${message}: ${error.message}`,
                error.stack,
            );
        } else if (error) {
            this.logger.error(`${contextStr}${message}: ${error}`);
        } else {
            this.logger.error(`${contextStr}${message}`);
        }
        if (meta && Object.keys(meta).length > 0) {
            this.logger.error(`Meta: ${JSON.stringify(meta)}`);
        }
    }

    /**
     * Log de advertencia
     */
    warn(message: string, context?: string, meta?: Record<string, unknown>): void {
        const contextStr = context ? `[${context}] ` : '';
        const metaStr = meta && Object.keys(meta).length > 0 
            ? ` ${JSON.stringify(meta)}` 
            : '';
        this.logger.warn(`${contextStr}${message}${metaStr}`);
    }

    /**
     * Log de debug (solo en desarrollo)
     */
    debug(message: string, context?: string, meta?: Record<string, unknown>): void {
        const contextStr = context ? `[${context}] ` : '';
        const metaStr = meta && Object.keys(meta).length > 0 
            ? ` ${JSON.stringify(meta)}` 
            : '';
        this.logger.debug(`${contextStr}${message}${metaStr}`);
    }

    /**
     * Log de verbose (más detallado que debug)
     */
    verbose(message: string, context?: string, meta?: Record<string, unknown>): void {
        const contextStr = context ? `[${context}] ` : '';
        const metaStr = meta && Object.keys(meta).length > 0 
            ? ` ${JSON.stringify(meta)}` 
            : '';
        this.logger.verbose(`${contextStr}${message}${metaStr}`);
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
        const detailsStr = details && Object.keys(details).length > 0
            ? ` ${JSON.stringify(details)}`
            : '';
        this.logger.log(
            `[AUDIT] ${action} - User: ${userId}, Resource: ${resource}${detailsStr}`,
        );
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
        const metaStr = meta && Object.keys(meta).length > 0
            ? ` ${JSON.stringify(meta)}`
            : '';
        const message = `[PERF] ${label} - ${durationMs}ms${metaStr}`;
        if (durationMs > threshold) {
            this.logger.warn(message);
        } else {
            this.logger.log(message);
        }
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
        const userIdStr = userId ? ` User: ${userId}` : '';
        const message = `[HTTP] ${method} ${url} ${statusCode} - ${durationMs}ms${userIdStr}`;
        if (statusCode >= 500) {
            this.logger.error(message);
        } else if (statusCode >= 400) {
            this.logger.warn(message);
        } else {
            this.logger.log(message);
        }
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
        const userIdStr = userId ? ` User: ${userId}` : '';
        const metaStr = meta && Object.keys(meta).length > 0
            ? ` ${JSON.stringify(meta)}`
            : '';
        const message = `[HTTP] ${method} ${url} ${statusCode} - ${durationMs}ms${userIdStr}${metaStr}`;
        if (statusCode >= 500) {
            this.logger.error(message);
        } else if (statusCode >= 400) {
            this.logger.warn(message);
        } else {
            this.logger.log(message);
        }
    }

    /**
     * Log de error con stack trace completo
     */
    logErrorWithStack(
        error: Error,
        context: string,
        meta?: Record<string, unknown>,
    ): void {
        const metaStr = meta && Object.keys(meta).length > 0
            ? ` ${JSON.stringify(meta)}`
            : '';
        this.logger.error(
            `[${context}] ${error.message}${metaStr}`,
            error.stack,
        );
    }
}
