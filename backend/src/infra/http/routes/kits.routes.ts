import { Router } from 'express';
import { KitsController } from '../controllers/KitsController.js';
import { authenticate } from '../../../shared/middlewares/authenticate.js';
import { authorize } from '../../../shared/middlewares/authorize.js';
import { PERMISSIONS } from '../../../shared/constants/permissions.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * GET /api/kits
 * Listar kits con filtros y paginación
 */
router.get('/', authorize([PERMISSIONS.KITS_VIEW]), KitsController.list);

/**
 * GET /api/kits/stats
 * Obtener estadísticas de kits
 * Nota: Esta ruta debe ir antes de /:id para evitar conflictos
 */
router.get('/stats', authorize([PERMISSIONS.KITS_VIEW]), KitsController.getStats);

/**
 * GET /api/kits/category/:category
 * Obtener kits por categoría
 */
router.get(
  '/category/:category',
  authorize([PERMISSIONS.KITS_VIEW]),
  KitsController.getByCategory
);

/**
 * GET /api/kits/:id
 * Obtener kit por ID
 */
router.get('/:id', authorize([PERMISSIONS.KITS_VIEW]), KitsController.getById);

/**
 * POST /api/kits
 * Crear nuevo kit
 */
router.post('/', authorize([PERMISSIONS.KITS_MANAGE]), KitsController.create);

/**
 * PUT /api/kits/:id
 * Actualizar kit
 */
router.put('/:id', authorize([PERMISSIONS.KITS_MANAGE]), KitsController.update);

/**
 * DELETE /api/kits/:id
 * Eliminar kit (soft delete)
 */
router.delete('/:id', authorize([PERMISSIONS.KITS_MANAGE]), KitsController.delete);

/**
 * POST /api/kits/:id/duplicate
 * Duplicar kit
 */
router.post('/:id/duplicate', authorize([PERMISSIONS.KITS_MANAGE]), KitsController.duplicate);

/**
 * POST /api/kits/suggest
 * Sugerir kit basado en descripción
 */
router.post('/suggest', authorize([PERMISSIONS.KITS_VIEW]), KitsController.suggest);

export default router;
