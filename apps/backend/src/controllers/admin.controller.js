/**
 * Admin Controller (October 2025)
 * @description Endpoints de administración para gestionar rate limiting
 */

import { rateLimitManager } from '../middleware/rateLimiter.js';
import { successResponse, errorResponse, HTTP_STATUS } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';

/**
 * Obtener estadísticas de rate limiting
 * @route GET /api/v1/admin/rate-limit/stats
 * @access Private (Admin only)
 */
export const getRateLimitStats = asyncHandler(async (req, res) => {
  const stats = rateLimitManager.getStats();
  
  return successResponse(
    res,
    {
      stats,
      timestamp: new Date().toISOString(),
    },
    'Estadísticas de rate limiting obtenidas'
  );
});

/**
 * Bloquear IP
 * @route POST /api/v1/admin/rate-limit/block
 * @access Private (Admin only)
 */
export const blockIp = asyncHandler(async (req, res) => {
  const { ip, reason } = req.body;
  
  if (!ip) {
    return errorResponse(
      res,
      'IP es requerida',
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  rateLimitManager.blockIp(ip, reason || 'Manual block by admin');
  
  logger.info(`IP blocked by admin: ${ip} by user ${req.userId}`);
  
  return successResponse(
    res,
    { ip, reason },
    'IP bloqueada exitosamente'
  );
});

/**
 * Desbloquear IP
 * @route POST /api/v1/admin/rate-limit/unblock
 * @access Private (Admin only)
 */
export const unblockIp = asyncHandler(async (req, res) => {
  const { ip } = req.body;
  
  if (!ip) {
    return errorResponse(
      res,
      'IP es requerida',
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  rateLimitManager.unblockIp(ip);
  
  logger.info(`IP unblocked by admin: ${ip} by user ${req.userId}`);
  
  return successResponse(
    res,
    { ip },
    'IP desbloqueada exitosamente'
  );
});

/**
 * Agregar IP a whitelist
 * @route POST /api/v1/admin/rate-limit/whitelist
 * @access Private (Admin only)
 */
export const whitelistIp = asyncHandler(async (req, res) => {
  const { ip } = req.body;
  
  if (!ip) {
    return errorResponse(
      res,
      'IP es requerida',
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  rateLimitManager.whitelistIp(ip);
  
  logger.info(`IP whitelisted by admin: ${ip} by user ${req.userId}`);
  
  return successResponse(
    res,
    { ip },
    'IP agregada a whitelist exitosamente'
  );
});

/**
 * Remover IP de whitelist
 * @route DELETE /api/v1/admin/rate-limit/whitelist/:ip
 * @access Private (Admin only)
 */
export const removeFromWhitelist = asyncHandler(async (req, res) => {
  const { ip } = req.params;
  
  if (!ip) {
    return errorResponse(
      res,
      'IP es requerida',
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  rateLimitManager.removeFromWhitelist(ip);
  
  logger.info(`IP removed from whitelist by admin: ${ip} by user ${req.userId}`);
  
  return successResponse(
    res,
    { ip },
    'IP removida de whitelist exitosamente'
  );
});

/**
 * Resetear límite para una IP
 * @route POST /api/v1/admin/rate-limit/reset
 * @access Private (Admin only)
 */
export const resetIpLimit = asyncHandler(async (req, res) => {
  const { ip } = req.body;
  
  if (!ip) {
    return errorResponse(
      res,
      'IP es requerida',
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  const keysReset = rateLimitManager.resetIpLimit(ip);
  
  logger.info(`Rate limit reset for IP: ${ip} by user ${req.userId}`);
  
  return successResponse(
    res,
    { ip, keysReset },
    `Límite reseteado para IP (${keysReset} keys)`
  );
});

/**
 * Verificar estado de una IP
 * @route GET /api/v1/admin/rate-limit/check/:ip
 * @access Private (Admin only)
 */
export const checkIpStatus = asyncHandler(async (req, res) => {
  const { ip } = req.params;
  
  if (!ip) {
    return errorResponse(
      res,
      'IP es requerida',
      HTTP_STATUS.BAD_REQUEST
    );
  }
  
  const status = {
    ip,
    isWhitelisted: rateLimitManager.isWhitelisted(ip),
    isBlacklisted: rateLimitManager.isBlacklisted(ip),
    timestamp: new Date().toISOString(),
  };
  
  return successResponse(
    res,
    status,
    'Estado de IP obtenido'
  );
});
