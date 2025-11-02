/**
 * Not Found Middleware
 * @description Middleware para manejar rutas no encontradas (404)
 */

import { logger } from '../utils/logger.js';

/**
 * Middleware para rutas no encontradas
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 * @param {Function} next - Next middleware
 */
export const notFound = (req, res) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  error.statusCode = 404;
  
  // Log de la ruta no encontrada
  logger.warn(`404 - Ruta no encontrada: ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.status(404).json({
    success: false,
    message: `Ruta no encontrada - ${req.originalUrl}`,
    errorCode: 'NOT_FOUND',
    timestamp: new Date().toISOString(),
  });
};

export default notFound;
