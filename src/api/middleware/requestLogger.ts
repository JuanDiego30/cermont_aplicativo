import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import pinoHttp from 'pino-http';
import { env } from '../config/env';
import { logger } from '../utils/logger';

function formatRoute(req: IncomingMessage): string {
  const method = req.method ?? 'request';
  const url = req.url ?? '';
  return `${method} ${url}`.trim();
}

export const requestLogger = pinoHttp({
  logger,
  autoLogging: env.nodeEnv !== 'test',
  customLogLevel: (_req, res, err) => {
    const status = res.statusCode ?? 0;
    if (err || status >= 500) {
      return 'error';
    }
    if (status >= 400) {
      return 'warn';
    }
    return 'info';
  },
  customSuccessMessage: (req, res, responseTime) => {
    const status = res.statusCode ?? 0;
    const duration = Number.isFinite(responseTime) ? responseTime.toFixed(2) : '0.00';
    return `${formatRoute(req)} completada (${status}) en ${duration} ms`;
  },
  customErrorMessage: (req, res, error) => {
    const status = res.statusCode ?? 0;
    const detail = error.message ?? 'Error desconocido';
    return `${formatRoute(req)} falló (${status}): ${detail}`;
  },
  genReqId: (req, res) => {
    const header = req.headers['x-request-id'];
    const id = typeof header === 'string' && header.trim().length > 0 ? header : randomUUID();
    res.setHeader('X-Request-Id', id);
    return id;
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.token',
      'res.headers.set-cookie',
    ],
    remove: true,
  },
});
