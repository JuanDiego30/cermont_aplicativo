import helmet from 'helmet';

/**
 * Configuración de security headers para desarrollo local
 * Versión adaptada para HTTPS en localhost (sin HSTS estricto)
 */
export const advancedSecurityHeaders = () => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", frontendUrl],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:', 'http:'],
        connectSrc: ["'self'", frontendUrl, 'ws://localhost:*', 'wss://localhost:*'],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    hsts: false,
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    dnsPrefetchControl: { allow: false },
  });
};

/**
 * Middleware para Permissions-Policy
 */
export const permissionsPolicy = (req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(self), microphone=(), camera=(), payment=(), usb=()'
  );
  next();
};

export default advancedSecurityHeaders;
