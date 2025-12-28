import { Injectable, LogLevel, Scope } from '@nestjs/common';
import pino, { Logger as PinoLogger } from 'pino';

interface LogContext {
  [key: string]: any;
}

@Injectable({ scope: Scope.TRANSIENT })
export class PinoLoggerService {
  private logger: PinoLogger;
  private context: string = '';

  constructor() {
    this.logger = pino({
      level: process.env.LOG_LEVEL || 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          singleLine: false,
          levelFirst: false,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          messageFormat: '{levelLabel} [{context}] {msg}',
        },
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    });
  }

  setContext(context: string): void {
    this.context = context;
  }

  private createLogEntry(message: string, meta?: LogContext) {
    return {
      context: this.context,
      timestamp: new Date().toISOString(),
      ...meta,
    };
  }

  log(message: string, context?: string, meta?: LogContext): void {
    const ctx = context || this.context;
    this.logger.info(this.createLogEntry(message, meta), `[${ctx}] ${message}`);
  }

  error(
    message: string,
    trace?: string,
    context?: string,
    meta?: LogContext,
  ): void {
    const ctx = context || this.context;
    const errorMeta = {
      ...this.createLogEntry(message, meta),
      trace,
      severity: 'ERROR',
    };
    this.logger.error(errorMeta, `[${ctx}] ${message}`);
  }

  warn(message: string, context?: string, meta?: LogContext): void {
    const ctx = context || this.context;
    const warnMeta = {
      ...this.createLogEntry(message, meta),
      severity: 'WARN',
    };
    this.logger.warn(warnMeta, `[${ctx}] ${message}`);
  }

  debug(message: string, context?: string, meta?: LogContext): void {
    const ctx = context || this.context;
    const debugMeta = {
      ...this.createLogEntry(message, meta),
      severity: 'DEBUG',
    };
    this.logger.debug(debugMeta, `[${ctx}] ${message}`);
  }

  verbose(message: string, context?: string, meta?: LogContext): void {
    const ctx = context || this.context;
    const verboseMeta = {
      ...this.createLogEntry(message, meta),
      severity: 'VERBOSE',
    };
    this.logger.trace(verboseMeta, `[${ctx}] ${message}`);
  }

  fatal(message: string, context?: string, meta?: LogContext): void {
    const ctx = context || this.context;
    const fatalMeta = {
      ...this.createLogEntry(message, meta),
      severity: 'FATAL',
    };
    this.logger.fatal(fatalMeta, `[${ctx}] ${message}`);
  }
}
