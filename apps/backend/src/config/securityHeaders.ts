/**
 * Security Configuration (TypeScript - November 2025)
 * @description Configuración avanzada de headers de seguridad con Helmet y Permissions-Policy, adaptada por entorno.
 * Uso: En server.ts (app.use(advancedSecurityHeaders()); app.use(permissionsPolicy);). Env: FRONTEND_URL='https://frontend.com', NODE_ENV='production'.
 * Integrado con: logger (debug en dev). Secure: CSP restrictivo (nonce en prod), HSTS solo prod, noSniff/XSSFilter on. COEP/COOP para isolation.
 * Performance: Non-blocking (helmet sets headers early). Extensible: CSP report-uri para monitoring (integra con audit logs).
 * Types: Usa @types/helmet y Express types. Pruebas: Mock helmet en Jest (jest.mock('helmet')). Para ATG: Deshabilita geolocation/camera si no needed.
 * Fixes: Typed directives (Record<string, string[]>), env fallbacks safe, permissions policy con switches env-aware. No eval en prod.
 */

import helmet, { HelmetOptions } from 'helmet';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Tipo para CSP directives - Flexible para arrays de strings
type CSPDirectives = Record<string, string[] | boolean>;

// Helper para generar nonce si needed (en prod, genera per-request via middleware si CSP nonce usado)
const generateNonce = (): string => {
  return Buffer.from(crypto.randomUUID()).toString('base64');
};

/**
 * Configuración de security headers adaptada por entorno
 * @returns Instancia de Helmet configurada
 */
export const advancedSecurityHeaders = (): ((req: Request, res: Response, next: NextFunction) => void) => {
  const isProduction: boolean = process.env.NODE_ENV === 'production';
  const frontendUrl: string = process.env.FRONTEND_URL || (isProduction ? 'https://your-frontend-domain.com' : 'http://localhost:3000');
  
  // CSP nonce: En prod, usa placeholder para per-request nonce (integra en middleware si scripts inline)
  const cspNonce: string = isProduction ? "'nonce-{{nonce}}'" : "'unsafe-inline'";

  // CSP base, restrictivo: No 'unsafe-eval', nonce/hash en prod
  const cspDirectives: Record<string, any> = {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      cspNonce,
      ...(isProduction ? [] : ["'unsafe-eval'"]), // Eval solo dev (testing/debug)
      frontendUrl, // Scripts del frontend si API calls
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'", // Shadcn/Tailwind inline styles
      'https://fonts.googleapis.com',
      ...(isProduction ? [] : ["'unsafe-inline'"]), // Duplicado para clarity, pero unsafe-inline ya permite
    ],
    fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
    imgSrc: ["'self'", 'data:', 'https:', ...(isProduction ? [] : ['http:'])], // HTTP solo dev
    connectSrc: [
      "'self'",
      frontendUrl,
      ...(isProduction ? ['wss://your-domain.com'] : ['ws://localhost:*', 'wss://localhost:*']), // WS localhost dev
    ],
    frameSrc: ["'none'"], // Anti-clickjacking
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"], // Limita forms
    upgradeInsecureRequests: isProduction ? [] : undefined, // HTTPS upgrade en prod
  };
  
  // Add reportUri only in production as a separate property
  if (isProduction) {
    cspDirectives.reportUri = ['/csp-report'];
  }

  // HSTS solo en prod (strict)
  const hstsConfig: boolean | HelmetOptions['hsts'] = isProduction ? {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true,
  } : false;

  // Config Helmet typed
  const helmetOptions: Partial<HelmetOptions> = {
    contentSecurityPolicy: {
      directives: cspDirectives,
      reportOnly: !isProduction, // Report-only en dev para testing sin breaks
    },
    hsts: hstsConfig,
    frameguard: { action: 'deny' },
    hidePoweredBy: true, // Oculta Express version
    ieNoOpen: true, // Legacy IE
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    dnsPrefetchControl: { allow: false },
    // Modern: Cross-origin isolation para SharedArrayBuffer si needed (e.g., Web Workers)
    crossOriginEmbedderPolicy: isProduction ? { policy: 'require-corp' } : false,
    crossOriginOpenerPolicy: isProduction ? { policy: 'same-origin' } : false,
    crossOriginResourcePolicy: { policy: 'same-origin' },
    originAgentCluster: isProduction ? true : false, // Isolation en prod
  };

  return helmet(helmetOptions);
};

/**
 * Middleware para Permissions-Policy - Configurable por entorno
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - Next function
 */
export const permissionsPolicy = (req: Request, res: Response, next: NextFunction): void => {
  const isProduction: boolean = process.env.NODE_ENV === 'production';
  
  // Restrictivo en prod: Deshabilita features no needed para ATG web app (no camera/mic/geolocation si no usado)
  let policy: string;
  if (isProduction) {
    policy = [
      'geolocation=()', // Off
      'microphone=()', 'camera=()', 'payment=()', 'usb=()', 'vr=()',
      'accelerometer=()', 'gyroscope=()', 'magnetometer=()', 'midi=()', 'notifications=()',
      'fullscreen=(self)', // Solo self domain
    ].join(', ');
  } else {
    // Dev: Permite geolocation/fullscreen para testing
    policy = [
      'geolocation=(self)', 'microphone=()', 'camera=()', 'payment=()', 'usb=()',
      'fullscreen=(self)', // Self en dev también
      'geolocation=(self)', // Duplicado para clarity
    ].join(', ');
  }

  res.setHeader('Permissions-Policy', policy);
  
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`Permissions-Policy set: ${policy.substring(0, 50)}...`);
  }
  
  next();
};

// Array de middlewares compuestos para uso fácil en app
export const securityMiddleware: Array<any> = [
  advancedSecurityHeaders(),
  permissionsPolicy,
];

export default advancedSecurityHeaders;

