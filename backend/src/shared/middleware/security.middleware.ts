/**
 * @middleware SecurityMiddleware
 *
 * Middleware de seguridad avanzado que incluye:
 * - Headers de seguridad HTTP (Helmet)
 * - Request ID único para tracing
 * - Validación de Content-Type
 * - Protección contra header bombing
 * - Logging de requests sospechosos
 *
 * Uso: Registrado globalmente en main.ts.
 *
 * Basado en: OWASP Security Headers + Additional Security Measures
 */
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { randomUUID } from 'crypto';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);
  private readonly helmetMiddleware = helmet({
    // Content Security Policy - Define fuentes permitidas
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    // Fuerza HTTPS (HSTS)
    hsts: {
      maxAge: 31536000, // 1 año
      includeSubDomains: true,
      preload: true,
    },
    // Previene clickjacking
    frameguard: { action: 'deny' },
    // Previene MIME type sniffing
    noSniff: true,
    // Oculta header X-Powered-By
    hidePoweredBy: true,
    // XSS Filter (legacy browsers)
    xssFilter: true,
    // Referrer Policy
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  });

  use(req: Request, res: Response, next: NextFunction): void {
    // 1. Aplicar headers de seguridad con Helmet
    this.helmetMiddleware(req, res, (err?: any) => {
      if (err) {
        return next(err);
      }

      // 2. Request ID único para tracing
      const requestId = (req.headers['x-request-id'] as string) || randomUUID();
      req.headers['x-request-id'] = requestId;
      res.setHeader('x-request-id', requestId);

      // 3. Headers de seguridad adicionales
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

      // 4. Validar Content-Type para requests con body
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.headers['content-type'];
        if (!contentType || !contentType.includes('application/json')) {
          // Para endpoints API que esperan JSON, rechazar otros tipos
          if (req.path.startsWith('/api/') && !req.path.includes('/upload')) {
            res.status(400).json({
              statusCode: 400,
              message: 'Content-Type must be application/json',
              error: 'Bad Request',
            });
            return;
          }
        }
      }

      // 5. Validar tamaño de headers (protección contra header bombing)
      const headerSize = JSON.stringify(req.headers).length;
      if (headerSize > 8192) {
        // 8KB límite
        res.status(431).json({
          statusCode: 431,
          message: 'Request Header Fields Too Large',
          error: 'Header Too Large',
        });
        return;
      }

      // 6. Validar User-Agent (básico)
      const userAgent = req.headers['user-agent'];
      if (!userAgent || userAgent.length < 10) {
        // Log suspicious request (se hará en el interceptor de logging)
        this.logger.warn(
          `Suspicious request without proper User-Agent: ip=${req.ip} method=${req.method} path=${req.path}`
        );
      }

      // 7. Rate limiting headers (informational)
      res.setHeader('X-RateLimit-Reset', Math.floor(Date.now() / 1000) + 60);

      // 8. Timestamp del servidor
      res.setHeader('X-Timestamp', Date.now().toString());

      next();
    });
  }
}
