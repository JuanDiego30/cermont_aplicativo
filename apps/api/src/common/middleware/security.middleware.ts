/**
 * @middleware SecurityMiddleware
 *
 * Aplica headers de seguridad HTTP usando helmet.
 * Incluye: HSTS, XSS Protection, Content-Type Options, Frame Options.
 *
 * Uso: Registrado globalmente en main.ts.
 * 
 * Basado en: OWASP Security Headers Best Practices
 */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
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
        this.helmetMiddleware(req, res, next);
    }
}
