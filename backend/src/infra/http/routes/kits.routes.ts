import { Router } from 'express';
import { KitsController } from '../controllers/KitsController.js';
import { authenticate } from '../../../shared/middlewares/authenticate.js';
import { authorize } from '../../../shared/middlewares/authorize.js';
import { PERMISSIONS } from '../../../shared/constants/permissions.js';

const router = Router();

// Todas las rutas requieren autenticaci�n
router.use(authenticate);

/**
 * GET /api/kits
 * Listar kits con filtros y paginaci�n
 */
router.get('/', authorize([PERMISSIONS.READ_KITS]), KitsController.list);

/**
 * GET /api/kits/stats
 * Obtener estad�sticas de kits
 * Nota: Esta ruta debe ir antes de /:id para evitar conflictos
 */
router.get('/stats', authorize([PERMISSIONS.READ_KITS]), KitsController.getStats);

/**
 * GET /api/kits/category/:category
 * Obtener kits por categor�a
 */
router.get(
  '/category/:category',
  authorize([PERMISSIONS.READ_KITS]),
  KitsController.getByCategory
);

/**
 * GET /api/kits/:id
 * Obtener kit por ID
 */
router.get('/:id', authorize([PERMISSIONS.READ_KITS]), KitsController.getById);

/**
 * POST /api/kits
 * Crear nuevo kit
 */
router.post('/', authorize([PERMISSIONS.WRITE_KITS]), KitsController.create);

/**
 * PUT /api/kits/:id
 * Actualizar kit
 */
router.put('/:id', authorize([PERMISSIONS.WRITE_KITS]), KitsController.update);

/**
 * DELETE /api/kits/:id
 * Eliminar kit (soft delete)
 */
router.delete('/:id', authorize([PERMISSIONS.DELETE_KITS]), KitsController.delete);

/**
 * POST /api/kits/:id/duplicate
 * Duplicar kit
 */
router.post('/:id/duplicate', authorize([PERMISSIONS.WRITE_KITS]), KitsController.duplicate);

export default router;
