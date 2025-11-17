import { Request, Response } from 'express';
import { logger } from '../utils/logger.js';

/**
 * ========================================
 * NOT FOUND MIDDLEWARE
 * ========================================
 * Middleware para manejar rutas no encontradas (404).
 * Debe colocarse DESPU�S de todas las rutas pero ANTES del errorHandler.
 *
 * @example
 * ```
 * import { notFound } from './middlewares/notFound.js';
 *
 * // Despu�s de todas las rutas
 * app.use('/api', apiRoutes);
 * app.use(notFound);
 * app.use(errorHandler);
 * ```
 */

/**
 * Middleware para manejar rutas no encontradas
 */
export function notFound(req: Request, res: Response): void {
  logger.warn('Route not found', {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    userId: req.user?.userId,
  });

  res.status(404).json({
    type: 'https://httpstatuses.com/404',
    title: 'Not Found',
    status: 404,
    detail: `Ruta no encontrada: ${req.method} ${req.path}`,
    instance: req.path,
    suggestions: [
      'Verifica la URL',
      'Consulta la documentaci�n en /api',
      'Revisa el m�todo HTTP utilizado',
    ],
  });
}
