import { Router } from 'express';
import { ordenesController } from './ordenes.controller.js';
import { authMiddleware, roleMiddleware } from '../auth/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// CRUD
router.get('/', ordenesController.list);
router.get('/:id', ordenesController.getById);
router.post('/', ordenesController.create);
router.patch('/:id', ordenesController.update);
router.delete('/:id', roleMiddleware('admin', 'supervisor'), ordenesController.delete);

// Acciones especiales
router.post('/:id/asignar', roleMiddleware('admin', 'supervisor'), ordenesController.assignResponsable);
router.post('/:id/estado', ordenesController.changeStatus);

export default router;
