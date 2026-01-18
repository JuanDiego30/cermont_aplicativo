import { environment } from '../../../environments/environment';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function shouldLog(level: LogLevel): boolean {
  if (environment.production) return false;
  if (level === 'error' || level === 'warn') return true;
  return !!environment.enableDebug;
}

function normalizeError(error: unknown): Record<string, unknown> | undefined {
  if (!error) return undefined;
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (typeof error === 'object') {
    const maybe = error as { message?: unknown; status?: unknown } | null;
    return {
      message: typeof maybe?.message === 'string' ? maybe.message : undefined,
      status: typeof maybe?.status === 'number' ? maybe.status : undefined,
    };
  }

  return { message: String(error) };
}

export function logDebug(message: string, context?: Record<string, unknown>): void {
  if (!shouldLog('debug')) return;
  console.debug(message, context);
}

export function logInfo(message: string, context?: Record<string, unknown>): void {
  if (!shouldLog('info')) return;
  console.info(message, context);
}

export function logWarn(message: string, context?: Record<string, unknown>): void {
  if (!shouldLog('warn')) return;
  console.warn(message, context);
}

export function logError(
  message: string,
  error?: unknown,
  context?: Record<string, unknown>
): void {
  if (!shouldLog('error')) return;
  console.error(message, { ...context, error: normalizeError(error) });
}
