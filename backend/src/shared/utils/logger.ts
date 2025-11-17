/**
 * ========================================
 * SIMPLE LOGGER
 * ========================================
 * Logger básico para la aplicación (reemplaza winston por simplicidad).
 */

interface LogMetadata {
  [key: string]: any;
}

class Logger {
  private formatMessage(level: string, message: string, metadata?: LogMetadata): string {
    const timestamp = new Date().toISOString();
    let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;

    if (metadata && Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }

    return msg;
  }

  private shouldLog(): boolean {
    return process.env.NODE_ENV !== 'test';
  }

  info(message: string, metadata?: LogMetadata): void {
    if (!this.shouldLog()) {
      return;
    }

    console.log(this.formatMessage('info', message, metadata));
  }

  warn(message: string, metadata?: LogMetadata): void {
    if (!this.shouldLog()) {
      return;
    }

    console.warn(this.formatMessage('warn', message, metadata));
  }

  error(message: string, metadata?: LogMetadata): void {
    if (!this.shouldLog()) {
      return;
    }

    console.error(this.formatMessage('error', message, metadata));
  }

  debug(message: string, metadata?: LogMetadata): void {
    if (process.env.NODE_ENV === 'development' && this.shouldLog()) {
      console.debug(this.formatMessage('debug', message, metadata));
    }
  }
}

export const logger = new Logger();