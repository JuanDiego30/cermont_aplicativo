import { Request, Response, NextFunction } from 'express';
import { tokenBlacklistRepository } from '../../infra/db/repositories/TokenBlacklistRepository.js';
import { logger } from '../utils/logger.js';
import { loginFailedTotal } from '../metrics/prometheus.js';
import { jwtService } from '../security/jwtService.js';

/**
 * Extender Request interface para incluir user
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
        jti: string;
      };
    }
  }
}

/**
 * Middleware de autenticación JWT
 * Verifica el token JWT en el header Authorization
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extraer token del header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      loginFailedTotal.inc({ reason: 'missing_token' });
      res.status(401).json({
        type: 'https://httpstatuses.com/401',
        title: 'Unauthorized',
        status: 401,
        detail: 'Token de autenticación requerido',
      });
      return;
    }

    // Extraer token
    const token = authHeader.substring(7);

    // Verificar token con jwtService (JOSE)
    const payload = await jwtService.verifyAccessToken(token);

    // Verificar si JTI está en blacklist
    const isBlacklisted = await tokenBlacklistRepository.isBlacklisted(payload.jti);

    if (isBlacklisted) {
      logger.warn('Blacklisted token used', {
        userId: payload.userId,
        jti: payload.jti,
        path: req.path,
      });

      loginFailedTotal.inc({ reason: 'blacklisted_token' });
      res.status(401).json({
        type: 'https://httpstatuses.com/401',
        title: 'Unauthorized',
        status: 401,
        detail: 'Token inválido o expirado',
      });
      return;
    }

    // Agregar usuario al request
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      jti: payload.jti,
    };

    logger.debug('Authentication successful', {
      userId: payload.userId,
      path: req.path,
    });

    next();
  } catch (error: any) {
    logger.warn('Authentication failed', {
      error: error.message,
      path: req.path,
      ip: req.ip,
    });

    loginFailedTotal.inc({ reason: 'invalid_token' });

    let status = 401;
    let detail = 'Token inválido o expirado';

    if (error.message === 'Token expirado') {
      status = 401;
      detail = 'Token expirado';
    }

    res.status(status).json({
      type: `https://httpstatuses.com/${status}`,
      title: 'Unauthorized',
      status,
      detail,
    });
  }
}

/**
 * Middleware de autenticación opcional
 * No falla si no hay token, pero inyecta usuario si existe
 *
 * @example
 * ```
 * router.get('/public', authenticateOptional, (req, res) => {
 *   if (req.user) {
 *     // Usuario autenticado
 *   } else {
 *     // Usuario anónimo
 *   }
 * });
 * ```
 */
export async function authenticateOptional(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No hay token, continuar como anónimo
    next();
    return;
  }

  // Intentar autenticar
  await authenticate(req, res, next);
}
