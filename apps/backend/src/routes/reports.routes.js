/**
 * Reports Routes
 * @description Rutas para reportes CCTV y evidencias
 */

import { Router } from 'express';
import {
  getAllCctvReports,
  getCctvReportById,
  createCctvReport,
  updateCctvReport,
  deleteCctvReport,
  approveCctvReport,
  getReportsByOrder,
} from '../controllers/reports.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireMinRole } from '../middleware/rbac.js';
import { validateObjectId } from '../middleware/validate.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * Todas las rutas requieren autenticación
 */
router.use(authenticate);

/**
 * @route   GET /api/v1/reports/cctv
 * @desc    Obtener todos los reportes CCTV
 * @access  Private
 */
router.get(
  '/cctv',
  getAllCctvReports
);

/**
 * @route   GET /api/v1/reports/cctv/:id
 * @desc    Obtener reporte CCTV por ID
 * @access  Private
 */
router.get(
  '/cctv/:id',
  validateObjectId('id'),
  getCctvReportById
);

/**
 * @route   POST /api/v1/reports/cctv
 * @desc    Crear reporte CCTV
 * @access  Private (Technician, Supervisor, Engineer)
 */
router.post(
  '/cctv',
  requireMinRole('technician'),
  createRateLimiter,
  createCctvReport
);

/**
 * @route   PUT /api/v1/reports/cctv/:id
 * @desc    Actualizar reporte CCTV
 * @access  Private (Creator or Admin)
 */
router.put(
  '/cctv/:id',
  validateObjectId('id'),
  updateCctvReport
);

/**
 * @route   DELETE /api/v1/reports/cctv/:id
 * @desc    Eliminar reporte CCTV
 * @access  Private (Admin, Engineer)
 */
router.delete(
  '/cctv/:id',
  validateObjectId('id'),
  requireMinRole('engineer'),
  deleteCctvReport
);

/**
 * @route   POST /api/v1/reports/cctv/:id/approve
 * @desc    Aprobar reporte CCTV
 * @access  Private (Supervisor, Engineer, Admin)
 */
router.post(
  '/cctv/:id/approve',
  validateObjectId('id'),
  requireMinRole('supervisor'),
  approveCctvReport
);

/**
 * @route   GET /api/v1/reports/order/:orderId
 * @desc    Obtener todos los reportes de una orden
 * @access  Private
 */
router.get(
  '/order/:orderId',
  validateObjectId('orderId'),
  getReportsByOrder
);

export default router;
