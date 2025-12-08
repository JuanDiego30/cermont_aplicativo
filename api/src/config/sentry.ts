/**
 * Sistema de rastreo y monitoreo de errores usando Sentry para Cermont. Captura
 * excepciones no manejadas, rechazos de promesas, errores HTTP y eventos personalizados
 * con contexto enriquecido (usuario, request, tags). Configura muestreo de performance
 * monitoring diferenciado por ambiente (10% production, 100% development) y proporciona
 * middleware para Express que automáticamente reporta errores con stack traces completos.
 */

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
      Sentry.httpIntegration(),
      Sentry.onUncaughtExceptionIntegration(),
      Sentry.onUnhandledRejectionIntegration(),
    ],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    attachStacktrace: true,
    maxBreadcrumbs: 50,
    debug: process.env.NODE_ENV !== 'production',
  });

  logger.info('Sentry initialized successfully');
}

export function sentryErrorHandler(): ErrorRequestHandler {
  return (err: Error, _req: Request, _res: Response, next: NextFunction) => {
    Sentry.captureException(err);
    next(err);
  };
}

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

  logger.error('Exception captured', {
    message: error.message,
    stack: error.stack,
    ...context,
  });
}

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

