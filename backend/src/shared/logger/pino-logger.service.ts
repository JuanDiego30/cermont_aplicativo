import { Injectable, Logger, Scope } from "@nestjs/common";

interface LogContext {
  [key: string]: unknown;
}

/**
 * PinoLoggerService - Wrapper around NestJS Logger
 * Uses NestJS Logger which integrates well with the framework
 * Can be replaced with actual Pino when pino-pretty is installed
 */
@Injectable({ scope: Scope.TRANSIENT })
export class PinoLoggerService {
  private logger: Logger;
  private contextName: string = "Application";

  constructor() {
    this.logger = new Logger(this.contextName);
  }

  setContext(context: string): void {
    this.contextName = context;
    this.logger = new Logger(context);
  }

  private formatMessage(message: string, meta?: LogContext): string {
    if (meta && Object.keys(meta).length > 0) {
      return `${message} ${JSON.stringify(meta)}`;
    }
    return message;
  }

  log(message: string, context?: string, meta?: LogContext): void {
    const ctx = context || this.contextName;
    if (context && context !== this.contextName) {
      this.logger = new Logger(ctx);
    }
    this.logger.log(this.formatMessage(message, meta));
  }

  error(
    message: string,
    trace?: string,
    context?: string,
    meta?: LogContext,
  ): void {
    const ctx = context || this.contextName;
    if (context && context !== this.contextName) {
      this.logger = new Logger(ctx);
    }
    const fullMeta = { ...meta, trace };
    this.logger.error(this.formatMessage(message, fullMeta), trace);
  }

  warn(message: string, context?: string, meta?: LogContext): void {
    const ctx = context || this.contextName;
    if (context && context !== this.contextName) {
      this.logger = new Logger(ctx);
    }
    this.logger.warn(this.formatMessage(message, meta));
  }

  debug(message: string, context?: string, meta?: LogContext): void {
    const ctx = context || this.contextName;
    if (context && context !== this.contextName) {
      this.logger = new Logger(ctx);
    }
    this.logger.debug(this.formatMessage(message, meta));
  }

  verbose(message: string, context?: string, meta?: LogContext): void {
    const ctx = context || this.contextName;
    if (context && context !== this.contextName) {
      this.logger = new Logger(ctx);
    }
    this.logger.verbose(this.formatMessage(message, meta));
  }

  fatal(message: string, context?: string, meta?: LogContext): void {
    const ctx = context || this.contextName;
    if (context && context !== this.contextName) {
      this.logger = new Logger(ctx);
    }
    this.logger.fatal(this.formatMessage(message, meta));
  }
}
