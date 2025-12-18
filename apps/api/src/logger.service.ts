import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'cermont-api' },
      transports: [
        // Console transport for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),

        // Error log file
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '20m',
          maxFiles: '14d'
        }),

        // Combined log file
        new DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d'
        }),

        // Performance log file
        new DailyRotateFile({
          filename: 'logs/performance-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'info',
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        })
      ]
    });
  }

  log(message: string, context?: string, meta?: any) {
    this.logger.info(message, { context, ...meta });
  }

  error(message: string, trace?: string, context?: string, meta?: any) {
    this.logger.error(message, { trace, context, ...meta });
  }

  warn(message: string, context?: string, meta?: any) {
    this.logger.warn(message, { context, ...meta });
  }

  debug(message: string, context?: string, meta?: any) {
    this.logger.debug(message, { context, ...meta });
  }

  verbose(message: string, context?: string, meta?: any) {
    this.logger.verbose(message, { context, ...meta });
  }

  // Performance logging methods
  logPerformance(operation: string, duration: number, meta?: any) {
    this.logger.info(`Performance: ${operation}`, {
      duration,
      type: 'performance',
      ...meta
    });
  }

  // Security logging methods
  logSecurity(event: string, userId?: string, ip?: string, meta?: any) {
    this.logger.warn(`Security: ${event}`, {
      userId,
      ip,
      type: 'security',
      ...meta
    });
  }

  // Database logging methods
  logDatabase(operation: string, table: string, duration?: number, meta?: any) {
    this.logger.info(`Database: ${operation} on ${table}`, {
      duration,
      type: 'database',
      ...meta
    });
  }

  // API logging methods
  logApiRequest(method: string, url: string, statusCode: number, duration: number, userId?: string, meta?: any) {
    this.logger.info(`API: ${method} ${url}`, {
      statusCode,
      duration,
      userId,
      type: 'api',
      ...meta
    });
  }

  // Error with stack trace
  logErrorWithStack(error: Error, context?: string, meta?: any) {
    this.logger.error(error.message, {
      stack: error.stack,
      context,
      type: 'error',
      ...meta
    });
  }
}