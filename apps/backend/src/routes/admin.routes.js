/**
 * Admin Routes (October 2025)
 * @description Rutas de administración para rate limiting
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorize.js';
import {
  getRateLimitStats,
  blockIp,
  unblockIp,
  whitelistIp,
  removeFromWhitelist,
  resetIpLimit,
  checkIpStatus,
} from '../controllers/admin.controller.js';

const router = express.Router();

// Aplicar autenticación y autorización (solo admin/root)
router.use(authenticate);
router.use(authorizeRoles('root', 'admin'));

/**
 * @route   GET /api/v1/admin/rate-limit/stats
 * @desc    Obtener estadísticas de rate limiting
 * @access  Private (Admin)
 */
router.get('/rate-limit/stats', getRateLimitStats);

/**
 * @route   POST /api/v1/admin/rate-limit/block
 * @desc    Bloquear una IP
 * @access  Private (Admin)
 */
router.post('/rate-limit/block', blockIp);

/**
 * @route   POST /api/v1/admin/rate-limit/unblock
 * @desc    Desbloquear una IP
 * @access  Private (Admin)
 */
router.post('/rate-limit/unblock', unblockIp);

/**
 * @route   POST /api/v1/admin/rate-limit/whitelist
 * @desc    Agregar IP a whitelist
 * @access  Private (Admin)
 */
router.post('/rate-limit/whitelist', whitelistIp);

/**
 * @route   DELETE /api/v1/admin/rate-limit/whitelist/:ip
 * @desc    Remover IP de whitelist
 * @access  Private (Admin)
 */
router.delete('/rate-limit/whitelist/:ip', removeFromWhitelist);

/**
 * @route   POST /api/v1/admin/rate-limit/reset
 * @desc    Resetear límite de una IP
 * @access  Private (Admin)
 */
router.post('/rate-limit/reset', resetIpLimit);

/**
 * @route   GET /api/v1/admin/rate-limit/check/:ip
 * @desc    Verificar estado de una IP
 * @access  Private (Admin)
 */
router.get('/rate-limit/check/:ip', checkIpStatus);

export default router;
