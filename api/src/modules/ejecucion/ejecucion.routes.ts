import { Router } from 'express';
import { ejecucionController } from './ejecucion.controller.js';
import { validateBody, validateQuery } from '../../shared/middleware/validation.js';
import { authMiddleware, roleMiddleware } from '../auth/auth.middleware.js';
import { createEjecucionSchema, updateEjecucionSchema, actualizarTareaSchema, listEjecucionSchema } from './ejecucion.types.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/ejecucion - Listar ejecuciones
router.get(
    '/',
    validateQuery(listEjecucionSchema),
    ejecucionController.listar
);

// POST /api/ejecucion - Iniciar nueva ejecución
router.post(
    '/',
    roleMiddleware('admin', 'supervisor', 'tecnico'),
    validateBody(createEjecucionSchema),
    ejecucionController.iniciar
);

// GET /api/ejecucion/orden/:ordenId - Obtener por orden
router.get('/orden/:ordenId', ejecucionController.getByOrdenId);

// GET /api/ejecucion/:id - Obtener por ID
router.get('/:id', ejecucionController.getById);

// PATCH /api/ejecucion/:id - Actualizar progreso
router.patch(
    '/:id',
    roleMiddleware('admin', 'supervisor', 'tecnico'),
    validateBody(updateEjecucionSchema),
    ejecucionController.actualizarProgreso
);

// POST /api/ejecucion/:id/tarea - Completar tarea
router.post(
    '/:id/tarea',
    roleMiddleware('admin', 'supervisor', 'tecnico'),
    validateBody(actualizarTareaSchema),
    ejecucionController.completarTarea
);

// PATCH /api/ejecucion/:id/checklist/:checklistId - Actualizar checklist
router.patch(
    '/:id/checklist/:checklistId',
    roleMiddleware('admin', 'supervisor', 'tecnico'),
    ejecucionController.actualizarChecklist
);

// POST /api/ejecucion/:id/finalizar - Finalizar ejecución
router.post(
    '/:id/finalizar',
    roleMiddleware('admin', 'supervisor'),
    ejecucionController.finalizar
);

// POST /api/ejecucion/:id/pausar - Pausar ejecución
router.post(
    '/:id/pausar',
    roleMiddleware('admin', 'supervisor', 'tecnico'),
    ejecucionController.pausar
);

// POST /api/ejecucion/:id/reanudar - Reanudar ejecución
router.post(
    '/:id/reanudar',
    roleMiddleware('admin', 'supervisor', 'tecnico'),
    ejecucionController.reanudar
);

export default router;
