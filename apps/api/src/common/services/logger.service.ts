/**
 * @file logger.service.ts
 * @description Enterprise Logger Service usando Logger nativo de NestJS
 * @pattern Singleton
 *
 * Features:
 * - Logger nativo de NestJS (sin dependencias externas)
 * - Console output
 * - Log levels basados en environment
 */

import { Logger } from "@nestjs/common";

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

export interface LogContext {
  requestId?: string;
  userId?: string;
  [key: string]: unknown;
}

// Logger nativo de NestJS
const nestLogger = new Logger("CermontAPI");

export class LoggerService {
  private static instance: LoggerService;

  private constructor() {}

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  public debug(context: string, message: string, meta?: LogContext): void {
    const metaStr =
      meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
    nestLogger.debug(`[${context}] ${message}${metaStr}`);
  }

  public info(context: string, message: string, meta?: LogContext): void {
    const metaStr =
      meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
    nestLogger.log(`[${context}] ${message}${metaStr}`);
  }

  public warn(context: string, message: string, meta?: LogContext): void {
    const metaStr =
      meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
    nestLogger.warn(`[${context}] ${message}${metaStr}`);
  }

  public error(
    context: string,
    message: string,
    meta?: LogContext & { error?: Error },
  ): void {
    const metaStr =
      meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
    if (meta?.error) {
      nestLogger.error(`[${context}] ${message}${metaStr}`, meta.error.stack);
    } else {
      nestLogger.error(`[${context}] ${message}${metaStr}`);
    }
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
  private readonly logger: Logger;

  constructor(private readonly context: string) {
    this.logger = new Logger(context);
  }

  debug(message: string, meta?: LogContext): void {
    const metaStr =
      meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
    this.logger.debug(`${message}${metaStr}`);
  }

  info(message: string, meta?: LogContext): void {
    const metaStr =
      meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
    this.logger.log(`${message}${metaStr}`);
  }

  warn(message: string, meta?: LogContext): void {
    const metaStr =
      meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
    this.logger.warn(`${message}${metaStr}`);
  }

  error(message: string, meta?: LogContext & { error?: Error }): void {
    const metaStr =
      meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
    if (meta?.error) {
      this.logger.error(`${message}${metaStr}`, meta.error.stack);
    } else {
      this.logger.error(`${message}${metaStr}`);
    }
  }
}

// Export singleton instance
export const logger = LoggerService.getInstance();
