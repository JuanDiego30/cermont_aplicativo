// ============================================
// Sentry Error Tracking - Cermont FSM
// ============================================

import * as Sentry from '@sentry/node';
import type { Express, Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { logger } from './logger.js';

export function initSentry(_app: Express) {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    logger.warn('Sentry DSN not configured, error tracking disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      // HTTP integration
      Sentry.httpIntegration(),
      // Capture unhandled exceptions
      Sentry.onUncaughtExceptionIntegration(),
      // Capture unhandled promise rejections
      Sentry.onUnhandledRejectionIntegration(),
    ],
    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Attach stack traces
    attachStacktrace: true,
    // Max breadcrumbs
    maxBreadcrumbs: 50,
    // Debug mode
    debug: process.env.NODE_ENV !== 'production',
  });

  logger.info('Sentry initialized successfully');
}

// Middleware para capturar errores - Sentry v8+
export function sentryErrorHandler(): ErrorRequestHandler {
  return (err: Error, _req: Request, _res: Response, next: NextFunction) => {
    Sentry.captureException(err);
    next(err);
  };
}

// Capturar excepciones manualmente
export function captureException(
  error: Error,
  context?: Record<string, any>
) {
  Sentry.withScope((scope: Sentry.Scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
    }
    Sentry.captureException(error);
  });

  // También log local
  logger.error('Exception captured', {
    message: error.message,
    stack: error.stack,
    ...context,
  });
}

// Capturar eventos custom
export function captureEvent(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  extra?: Record<string, any>
) {
  Sentry.captureMessage(message, {
    level,
    extra,
  });
}

// Agregar contexto de usuario
export function setUserContext(user: {
  id: string;
  email?: string;
  username?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

// Middleware para agregar contexto de request
export function sentryRequestContext(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  Sentry.withScope((scope: Sentry.Scope) => {
    scope.setTag('path', req.path);
    scope.setTag('method', req.method);
    scope.setExtra('query', req.query);
    scope.setExtra('body', req.body);

    if ((req as any).user) {
      setUserContext({
        id: (req as any).user.userId,
        email: (req as any).user.email,
      });
    }
  });

  next();
}

export default {
  initSentry,
  sentryErrorHandler,
  captureException,
  captureEvent,
  setUserContext,
  sentryRequestContext,
};
