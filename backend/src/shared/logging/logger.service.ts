import { Injectable, Logger, LogLevel } from '@nestjs/common';
import { appendFile, mkdir, readdir, rename, stat, unlink } from 'fs/promises';
import { dirname, extname, resolve } from 'path';
import { sanitizeLogMeta, sanitizeUrl, shouldLog } from './sanitize';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  metadata?: unknown;
  trace?: string;
  event?: string;
}

type FileLoggingConfig =
  | {
      mode: 'single';
      filePath: string;
    }
  | {
      mode: 'split';
      infoFilePath: string;
      errorFilePath: string;
      maxBytes: number;
      maxFiles: number;
    };

@Injectable()
export class LoggerService extends Logger {
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 1000;

  private readonly configuredLevel: LogLevel;
  private readonly jsonFormat: boolean;
  private readonly fileConfig?: FileLoggingConfig;
  private fileInitPromise: Promise<void> | null = null;
  private lastRotationDate: string | null = null;

  constructor(context = 'CermontApp') {
    super(context);

    const level = (process.env.LOG_LEVEL || '').toLowerCase();
    this.configuredLevel = ['error', 'warn', 'log', 'debug', 'verbose'].includes(level)
      ? (level as LogLevel)
      : 'log';

    this.jsonFormat =
      (process.env.LOG_FORMAT || '').toLowerCase() === 'json' ||
      process.env.NODE_ENV === 'production';

    const enableFile = (process.env.LOG_TO_FILE || 'true').toLowerCase() !== 'false';
    if (enableFile) {
      const explicitPath = process.env.LOG_FILE_PATH;
      if (explicitPath && explicitPath.trim().length > 0) {
        // Compatibilidad: si existe LOG_FILE_PATH, mantener modo archivo único (sin rotación)
        this.fileConfig = {
          mode: 'single',
          filePath: resolve(explicitPath),
        };
      } else {
        const logDir = resolve(process.env.LOG_DIR || 'logs');
        const infoFilePath = resolve(logDir, process.env.LOG_INFO_FILE || 'info.log');
        const errorFilePath = resolve(logDir, process.env.LOG_ERROR_FILE || 'error.log');

        const maxBytesRaw = Number.parseInt(process.env.LOG_MAX_BYTES || '5242880', 10); // 5MB
        const maxFilesRaw = Number.parseInt(process.env.LOG_MAX_FILES || '10', 10);

        this.fileConfig = {
          mode: 'split',
          infoFilePath,
          errorFilePath,
          maxBytes: Number.isFinite(maxBytesRaw) && maxBytesRaw > 0 ? maxBytesRaw : 5242880,
          maxFiles: Number.isFinite(maxFilesRaw) && maxFilesRaw > 0 ? maxFilesRaw : 10,
        };
      }
    }
  }

  log(message: string, context?: string, metadata?: unknown): void {
    this.write('log', message, context, metadata);
  }

  info(message: string, context?: string, metadata?: unknown): void {
    this.write('log', message, context, metadata);
  }

  error(message: string, trace?: string, context?: string): void {
    this.write('error', message, context, undefined, trace);
  }

  warn(message: string, context?: string, metadata?: unknown): void {
    this.write('warn', message, context, metadata);
  }

  debug(message: string, context?: string, metadata?: unknown): void {
    this.write('debug', message, context, metadata);
  }

  verbose(message: string, context?: string, metadata?: unknown): void {
    this.write('verbose', message, context, metadata);
  }

  audit(action: string, userId: string, resource: string, details?: Record<string, unknown>): void {
    this.write(
      'log',
      `[AUDIT] ${action} - User: ${userId}, Resource: ${resource}`,
      'Audit',
      {
        action,
        userId,
        resource,
        details,
      },
      undefined,
      'audit'
    );
  }

  performance(
    label: string,
    durationMs: number,
    threshold: number = 1000,
    meta?: Record<string, unknown>
  ): void {
    const level: LogLevel = durationMs > threshold ? 'warn' : 'log';
    this.write(
      level,
      `[PERF] ${label} - ${durationMs}ms`,
      'Performance',
      { durationMs, threshold, ...meta },
      undefined,
      'performance'
    );
  }

  http(method: string, url: string, statusCode: number, durationMs: number, userId?: string): void {
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'log';
    this.write(
      level,
      `[HTTP] ${method} ${sanitizeUrl(url)} ${statusCode} - ${durationMs}ms`,
      'HTTP',
      {
        method,
        url: sanitizeUrl(url),
        statusCode,
        durationMs,
        userId,
      },
      undefined,
      'http'
    );
  }

  logApiRequest(
    method: string,
    url: string,
    statusCode: number,
    durationMs: number,
    userId?: string,
    meta?: Record<string, unknown>
  ): void {
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'log';
    this.write(
      level,
      `[HTTP] ${method} ${sanitizeUrl(url)} ${statusCode} - ${durationMs}ms`,
      'HTTP',
      {
        method,
        url: sanitizeUrl(url),
        statusCode,
        durationMs,
        userId,
        ...meta,
      },
      undefined,
      'http'
    );
  }

  logErrorWithStack(error: Error, context: string, meta?: Record<string, unknown>): void {
    this.write('error', error.message, context, { ...meta, error }, error.stack, 'error');
  }

  private write(
    level: LogLevel,
    message: string,
    context?: string,
    metadata?: unknown,
    trace?: string,
    event?: string
  ): void {
    if (!shouldLog(level, this.configuredLevel)) {
      return;
    }

    const safeMetadata = metadata ? sanitizeLogMeta(metadata) : undefined;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context || this.context,
      metadata: safeMetadata,
      trace,
      event,
    };

    this.addToHistory(entry);

    const output = this.jsonFormat
      ? JSON.stringify(entry)
      : safeMetadata
        ? `${message} ${JSON.stringify(safeMetadata)}`
        : message;

    // Emitir al logger base
    switch (level) {
      case 'error':
        super.error(output, trace, entry.context);
        break;
      case 'warn':
        super.warn(output, entry.context);
        break;
      case 'debug':
        super.debug(output, entry.context);
        break;
      case 'verbose':
        super.verbose(output, entry.context);
        break;
      default:
        super.log(output, entry.context);
        break;
    }

    // Persistencia a archivo (best-effort)
    if (this.fileConfig) {
      this.writeToFile(entry).catch(() => {
        // best-effort: evitar romper la app por problemas de IO
      });
    }
  }

  private async writeToFile(entry: LogEntry): Promise<void> {
    if (!this.fileConfig) return;

    const line = `${JSON.stringify(entry)}\n`;

    if (this.fileConfig.mode === 'single') {
      if (!this.fileInitPromise) {
        this.fileInitPromise = mkdir(dirname(this.fileConfig.filePath), {
          recursive: true,
        }).then(() => undefined);
      }
      await this.fileInitPromise;
      await appendFile(this.fileConfig.filePath, line, { encoding: 'utf8' });
      return;
    }

    // Modo split: error.log vs info.log con rotación/retención
    const targetPath =
      entry.level === 'error' ? this.fileConfig.errorFilePath : this.fileConfig.infoFilePath;

    if (!this.fileInitPromise) {
      // Crear ambas carpetas (por si son diferentes)
      this.fileInitPromise = Promise.all([
        mkdir(dirname(this.fileConfig.infoFilePath), { recursive: true }),
        mkdir(dirname(this.fileConfig.errorFilePath), { recursive: true }),
      ]).then(() => undefined);
    }
    await this.fileInitPromise;

    await this.rotateIfNeeded(targetPath, this.fileConfig.maxBytes);
    await appendFile(targetPath, line, { encoding: 'utf8' });
    await this.enforceRetention(targetPath, this.fileConfig.maxFiles);
  }

  private getTodayString(): string {
    // YYYY-MM-DD (UTC) para nombres determinísticos
    return new Date().toISOString().slice(0, 10);
  }

  private async rotateIfNeeded(filePath: string, maxBytes: number): Promise<void> {
    const today = this.getTodayString();

    // Rotación diaria: cuando cambia el día
    if (this.lastRotationDate && this.lastRotationDate !== today) {
      await this.rotateFile(filePath, this.lastRotationDate).catch(() => {
        // best-effort
      });
    }

    this.lastRotationDate = today;

    // Rotación por tamaño
    try {
      const stats = await stat(filePath);
      if (stats.size >= maxBytes) {
        await this.rotateFile(filePath, today);
      }
    } catch {
      // Si no existe aún, no rotar
    }
  }

  private async rotateFile(filePath: string, date: string): Promise<void> {
    // Si el archivo no existe/no tiene contenido, no rotar
    const stats = await stat(filePath).catch(() => null);
    if (!stats || stats.size === 0) return;

    const extension = extname(filePath) || '.log';
    const base = filePath.slice(0, -extension.length);

    const dir = dirname(filePath);
    const entries = await readdir(dir).catch(() => [] as string[]);

    const prefix = `${base}.${date}.`;
    const suffix = extension;

    let nextIndex = 1;
    for (const name of entries) {
      const full = resolve(dir, name);
      if (!full.startsWith(prefix) || !full.endsWith(suffix)) continue;

      const idxStr = full.slice(prefix.length, full.length - suffix.length);
      const idx = Number.parseInt(idxStr, 10);
      if (Number.isFinite(idx) && idx >= nextIndex) nextIndex = idx + 1;
    }

    const rotatedPath = `${base}.${date}.${nextIndex}${extension}`;
    await rename(filePath, rotatedPath).catch(() => {
      // best-effort
    });
  }

  private async enforceRetention(filePath: string, maxFiles: number): Promise<void> {
    const extension = extname(filePath) || '.log';
    const base = filePath.slice(0, -extension.length);
    const dir = dirname(filePath);

    const names = await readdir(dir).catch(() => [] as string[]);
    const rotated = names
      .map(n => resolve(dir, n))
      .filter(full => full.startsWith(`${base}.`) && full.endsWith(extension));

    if (rotated.length <= maxFiles) return;

    const withMtime = await Promise.all(
      rotated.map(async p => {
        const s = await stat(p).catch(() => null);
        return { path: p, mtimeMs: s?.mtimeMs ?? 0 };
      })
    );

    withMtime.sort((a, b) => a.mtimeMs - b.mtimeMs);

    const toDelete = withMtime.slice(0, Math.max(0, withMtime.length - maxFiles));
    await Promise.all(
      toDelete.map(({ path }) =>
        unlink(path).catch(() => {
          // best-effort
        })
      )
    );
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
