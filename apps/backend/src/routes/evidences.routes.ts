/**
 * @file evidences.routes.ts
 * @description Rutas para gestión de evidencias
 */

import { Router } from 'express';
import { uploadEvidence, getEvidences, getEvidenceById } from '../controllers/evidences.controller';
import { authenticate } from '../middleware/auth';
import authorize from '../middleware/authorize';
import { apiRateLimiter } from '../middleware/rateLimiter';
import { validateBody } from '../middleware/validate';
import { uploadEvidenceSchema } from '../schemas/evidence.schema';

const router = Router();

// Aplicar middlewares de seguridad
router.use(apiRateLimiter);
router.use(authenticate);

/**
 * POST /evidences
 * Subir nueva evidencia
 */
router.post(
  '/',
  authorize.requireRole('admin', 'manager', 'user'),
  validateBody(uploadEvidenceSchema),
  uploadEvidence
);

/**
 * GET /evidences
 * Obtener lista de evidencias
 */
router.get(
  '/',
  authorize.requireRole('admin', 'manager', 'user'),
  getEvidences
);

/**
 * GET /evidences/:id
 * Obtener evidencia específica
 */
router.get(
  '/:id',
  authorize.requireRole('admin', 'manager', 'user'),
  getEvidenceById
);

export default router;