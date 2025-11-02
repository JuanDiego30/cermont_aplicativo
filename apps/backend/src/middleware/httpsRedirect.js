/**
 * Middleware para forzar redirección HTTP → HTTPS
 * DESHABILITADO en desarrollo (localhost) para evitar loops
 */
export const httpsRedirect = (req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const sslEnabled = process.env.SSL_ENABLED === 'true';

  if (!isProduction) {
    return next();
  }
  if (!sslEnabled) {
    return next();
  }
  if (req.path === '/health' || req.path === '/api/health') {
    return next();
  }
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  if (!isSecure) {
    const host = req.headers.host || process.env.DOMAIN || 'localhost';
    return res.redirect(301, `https://${host}${req.url}`);
  }
  next();
};

export default httpsRedirect;
