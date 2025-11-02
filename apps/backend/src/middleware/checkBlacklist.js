import BlacklistedToken from '../models/BlacklistedToken.js';
import { createAuditLog } from './auditLogger.js';

/**
 * Middleware para verificar si el token JWT está en blacklist
 * Debe ejecutarse ANTES del middleware auth.js
 */
export const checkBlacklist = async (req, res, next) => {
  try {
    // Extraer token del header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No hay token, dejar que auth.js lo maneje
    }

    const token = authHeader.split(' ')[1];

    // Verificar si está en blacklist
    const isBlacklisted = await BlacklistedToken.isBlacklisted(token);

    if (isBlacklisted) {
      // Log de auditoría
      await createAuditLog({
        userId: null,
        userEmail: 'unknown',
        action: 'TOKEN_REVOKED',
        resource: 'Auth',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        method: req.method,
        endpoint: req.originalUrl,
        status: 'DENIED',
        severity: 'HIGH',
        errorMessage: 'Intento de usar token revocado'
      });

      return res.status(401).json({
        success: false,
        error: {
          message: 'Token revocado. Por favor inicia sesión nuevamente.',
          code: 'TOKEN_BLACKLISTED'
        }
      });
    }

    // Token válido, continuar
    next();
  } catch (error) {
    console.error('[CheckBlacklist] Error:', error.message);
    // En caso de error de DB, no bloquear (fail open)
    next();
  }
};

export default checkBlacklist;