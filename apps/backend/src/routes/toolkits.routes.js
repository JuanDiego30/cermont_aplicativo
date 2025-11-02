/**
 * ToolKits Routes
 * @description Rutas para kits de herramientas predefinidos
 */

import { Router } from 'express';
import {
  getAllToolKits,
  getToolKitById,
  getToolKitsByCategory,
  createToolKit,
  updateToolKit,
  deleteToolKit,
  incrementToolKitUsage,
  getMostUsedToolKits,
  cloneToolKit,
  toggleToolKitActive,
  getToolKitStats,
} from '../controllers/toolkits.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireMinRole, requireAdmin } from '../middleware/rbac.js';
import { validateObjectId } from '../middleware/validate.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * Todas las rutas requieren autenticación
 */
router.use(authenticate);

/**
 * @route   GET /api/v1/toolkits/stats/summary
 * @desc    Obtener estadísticas de toolkits
 * @access  Private (Admin, Engineer)
 */
router.get(
  '/stats/summary',
  requireMinRole('engineer'),
  getToolKitStats
);

/**
 * @route   GET /api/v1/toolkits/stats/most-used
 * @desc    Obtener toolkits más utilizados
 * @access  Private (Admin, Engineer)
 */
router.get(
  '/stats/most-used',
  requireMinRole('engineer'),
  getMostUsedToolKits
);

/**
 * @route   GET /api/v1/toolkits
 * @desc    Obtener todos los toolkits
 * @access  Private
 */
router.get(
  '/',
  getAllToolKits
);

/**
 * @route   GET /api/v1/toolkits/category/:categoria
 * @desc    Obtener toolkits por categoría
 * @access  Private
 */
router.get(
  '/category/:categoria',
  getToolKitsByCategory
);

/**
 * @route   GET /api/v1/toolkits/:id
 * @desc    Obtener toolkit por ID
 * @access  Private
 */
router.get(
  '/:id',
  validateObjectId('id'),
  getToolKitById
);

/**
 * @route   POST /api/v1/toolkits
 * @desc    Crear nuevo toolkit
 * @access  Private (Admin, Engineer, Supervisor)
 */
router.post(
  '/',
  requireMinRole('supervisor'),
  createRateLimiter,
  createToolKit
);

/**
 * @route   PUT /api/v1/toolkits/:id
 * @desc    Actualizar toolkit
 * @access  Private (Admin, Engineer, Supervisor)
 */
router.put(
  '/:id',
  validateObjectId('id'),
  requireMinRole('supervisor'),
  updateToolKit
);

/**
 * @route   DELETE /api/v1/toolkits/:id
 * @desc    Eliminar toolkit (soft delete)
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  validateObjectId('id'),
  requireAdmin,
  deleteToolKit
);

/**
 * @route   POST /api/v1/toolkits/:id/use
 * @desc    Incrementar contador de uso
 * @access  Private
 */
router.post(
  '/:id/use',
  validateObjectId('id'),
  incrementToolKitUsage
);

/**
 * @route   POST /api/v1/toolkits/:id/clone
 * @desc    Clonar toolkit
 * @access  Private (Admin, Engineer, Supervisor)
 */
router.post(
  '/:id/clone',
  validateObjectId('id'),
  requireMinRole('supervisor'),
  cloneToolKit
);

/**
 * @route   PATCH /api/v1/toolkits/:id/toggle-active
 * @desc    Activar/Desactivar toolkit
 * @access  Private (Admin only)
 */
router.patch(
  '/:id/toggle-active',
  validateObjectId('id'),
  requireAdmin,
  toggleToolKitActive
);

export default router;
