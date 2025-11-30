/**
 * Catch Utilities
 * 
 * Typed utilities for handling unknown errors in catch blocks.
 * Use these instead of `catch (error: any)`.
 */

import { AppError } from '../errors/AppError.js';
import { logger } from './logger.js';

/**
 * Extracts error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'Error desconocido';
}

/**
 * Extracts error stack from unknown error type
 */
export function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }
  return undefined;
}

/**
 * Checks if error has a specific property
 */
export function hasErrorProperty<K extends string>(
  error: unknown,
  property: K
): error is Record<K, unknown> {
  return error !== null && typeof error === 'object' && property in error;
}

/**
 * Wraps an unknown error into AppError for consistent handling
 */
export function wrapError(error: unknown, fallbackMessage = 'Error interno'): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  const message = getErrorMessage(error);
  const statusCode = hasErrorProperty(error, 'statusCode') 
    ? Number(error.statusCode) || 500 
    : 500;
  
  return new AppError(message || fallbackMessage, statusCode);
}

/**
 * Logs an unknown error safely
 */
export function logUnknownError(
  error: unknown, 
  context: string, 
  additionalInfo?: Record<string, unknown>
): void {
  const message = getErrorMessage(error);
  const stack = getErrorStack(error);
  
  logger.error(`${context}: ${message}`, {
    error: message,
    stack,
    ...additionalInfo,
  });
}

/**
 * Re-throws an error after logging (useful in catch blocks)
 */
export function rethrowWithLogging(
  error: unknown, 
  context: string,
  additionalInfo?: Record<string, unknown>
): never {
  logUnknownError(error, context, additionalInfo);
  throw wrapError(error, `Error en ${context}`);
}

/**
 * Handles error and returns a default value (useful for non-critical operations)
 */
export function handleErrorWithDefault<T>(
  error: unknown,
  context: string,
  defaultValue: T,
  additionalInfo?: Record<string, unknown>
): T {
  logUnknownError(error, context, additionalInfo);
  return defaultValue;
}

/**
 * Type guard for Prisma errors
 */
export function isPrismaError(error: unknown): error is Error & { code: string; meta?: unknown } {
  return (
    error instanceof Error && 
    'code' in error && 
    typeof (error as { code: unknown }).code === 'string' &&
    (error as { code: string }).code.startsWith('P')
  );
}

/**
 * Type guard for Axios/fetch errors
 */
export function isHttpError(error: unknown): error is Error & { 
  response?: { status: number; data?: unknown };
  status?: number;
} {
  if (!(error instanceof Error)) return false;
  
  return (
    ('response' in error && typeof (error as { response?: unknown }).response === 'object') ||
    ('status' in error && typeof (error as { status?: unknown }).status === 'number')
  );
}

/**
 * Extracts HTTP status from error
 */
export function getHttpStatusFromError(error: unknown): number {
  if (!isHttpError(error)) return 500;
  
  if (error.response?.status) return error.response.status;
  if (error.status) return error.status;
  
  return 500;
}
