import { Injectable, Logger, LogLevel } from '@nestjs/common';

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: string;
    metadata?: any;
    trace?: string;
}

@Injectable()
export class LoggerService extends Logger {
    private logHistory: LogEntry[] = [];
    private maxHistorySize = 1000;

    constructor(context = 'CermontApp') {
        super(context);
    }

    log(message: string, context?: string, metadata?: any): void {
        const logEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            level: 'log',
            message,
            context: context || this.context,
            metadata,
        };
        this.addToHistory(logEntry);
        super.log(message, context || this.context);
    }

    error(message: string, trace?: string, context?: string): void {
        const logEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            level: 'error',
            message,
            context: context || this.context,
            trace,
        };
        this.addToHistory(logEntry);
        super.error(message, trace, context || this.context);
    }

    warn(message: string, context?: string): void {
        const logEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            level: 'warn',
            message,
            context: context || this.context,
        };
        this.addToHistory(logEntry);
        super.warn(message, context || this.context);
    }

    debug(message: string, context?: string, metadata?: any): void {
        const logEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            level: 'debug',
            message,
            context: context || this.context,
            metadata,
        };
        this.addToHistory(logEntry);
        super.debug(message, context || this.context);
    }

    verbose(message: string, context?: string, metadata?: any): void {
        const logEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            level: 'verbose',
            message,
            context: context || this.context,
            metadata,
        };
        this.addToHistory(logEntry);
        super.verbose(message, context || this.context);
    }

    private addToHistory(entry: LogEntry): void {
        this.logHistory.push(entry);
        if (this.logHistory.length > this.maxHistorySize) {
            this.logHistory.shift();
        }
    }

    getHistory(limit = 100): LogEntry[] {
        return this.logHistory.slice(-limit);
    }

    clearHistory(): void {
        this.logHistory = [];
    }
}
