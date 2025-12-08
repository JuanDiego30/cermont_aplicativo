// ============================================
// KITS TÍPICOS ROUTES - Cermont FSM
// ============================================

import { Router } from 'express';
import { kitsController } from './kits.controller.js';
import { authMiddleware, roleMiddleware } from '../auth/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// ==========================================
// RUTAS PÚBLICAS (solo requieren autenticación)
// ==========================================

// Listar kits activos (para dropdowns en formularios)
router.get('/active', kitsController.listActive);

// Listar todos los kits (con filtros)
router.get('/', kitsController.list);

// Obtener kit por ID
router.get('/:id', kitsController.getById);

// ==========================================
// RUTAS DE ADMINISTRACIÓN (supervisores y admin)
// ==========================================

// Crear nuevo kit
router.post('/', roleMiddleware('admin', 'supervisor'), kitsController.create);

// Actualizar kit
router.patch('/:id', roleMiddleware('admin', 'supervisor'), kitsController.update);

// Activar kit
router.post('/:id/activate', roleMiddleware('admin', 'supervisor'), kitsController.activate);

// Desactivar kit (soft delete)
router.post('/:id/deactivate', roleMiddleware('admin', 'supervisor'), kitsController.deactivate);

// Duplicar kit
router.post('/:id/duplicate', roleMiddleware('admin', 'supervisor'), kitsController.duplicate);

// Eliminar kit permanentemente (solo admin)
router.delete('/:id', roleMiddleware('admin'), kitsController.delete);

export default router;
