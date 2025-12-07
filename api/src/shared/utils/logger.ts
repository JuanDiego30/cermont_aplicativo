import { env } from '../../config/env.js';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

const LOG_COLORS = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[35m', // Magenta
  RESET: '\x1b[0m',
};

interface LogMeta {
  [key: string]: unknown;
}

class Logger {
  private level: LogLevel;
  private context?: string;

  constructor(context?: string) {
    this.context = context;
    this.level = this.parseLogLevel(env.LOG_LEVEL ?? 'info');
  }

  private parseLogLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'error':
        return LogLevel.ERROR;
      case 'warn':
        return LogLevel.WARN;
      case 'info':
        return LogLevel.INFO;
      case 'debug':
        return LogLevel.DEBUG;
      default:
        return LogLevel.INFO;
    }
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: keyof typeof LogLevel, message: string, meta?: LogMeta): string {
    const timestamp = this.formatTimestamp();
    const contextPart = this.context ? `[${this.context}]` : '';
    const metaPart = meta ? ` ${JSON.stringify(meta)}` : '';
    
    if (env.NODE_ENV === 'development') {
      const color = LOG_COLORS[level];
      return `${color}${timestamp} [${level}]${contextPart} ${message}${metaPart}${LOG_COLORS.RESET}`;
    }
    
    // Production: JSON format for log aggregators
    return JSON.stringify({
      timestamp,
      level,
      context: this.context,
      message,
      ...meta,
    });
  }

  private log(level: LogLevel, levelName: keyof typeof LogLevel, message: string, meta?: LogMeta): void {
    if (level > this.level) return;

    const formattedMessage = this.formatMessage(levelName, message, meta);
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      default:
        console.log(formattedMessage);
    }
  }

  error(message: string, meta?: LogMeta): void {
    this.log(LogLevel.ERROR, 'ERROR', message, meta);
  }

  warn(message: string, meta?: LogMeta): void {
    this.log(LogLevel.WARN, 'WARN', message, meta);
  }

  info(message: string, meta?: LogMeta): void {
    this.log(LogLevel.INFO, 'INFO', message, meta);
  }

  debug(message: string, meta?: LogMeta): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, meta);
  }

  /**
   * Create a child logger with a specific context
   */
  child(context: string): Logger {
    const childContext = this.context ? `${this.context}:${context}` : context;
    return new Logger(childContext);
  }
}

// Default logger instance
export const logger = new Logger();

// Factory function to create contextualized loggers
export const createLogger = (context: string): Logger => {
  return new Logger(context);
};

export default logger;
