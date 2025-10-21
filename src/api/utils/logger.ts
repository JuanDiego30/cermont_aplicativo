import pino from 'pino';
import { env } from '../config/env';

const level = env.nodeEnv === 'test' ? 'silent' : env.logLevel;

export const logger = pino({
  level,
  base: {
    service: 'cermont-api',
    env: env.nodeEnv,
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.token',
      'res.headers.authorization',
      'res.headers.set-cookie',
    ],
    remove: true,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export type Logger = typeof logger;
