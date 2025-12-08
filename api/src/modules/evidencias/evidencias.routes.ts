import { Router } from 'express';
import multer from 'multer';
import { evidenciasController } from './evidencias.controller.js';
import { authMiddleware, roleMiddleware } from '../auth/auth.middleware.js';
import { validateQuery } from '../../shared/middleware/validation.js';
import { listEvidenciasSchema } from './evidencias.types.js';

const router = Router();

// Configurar multer para almacenar en memoria
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
    },
});

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/evidencias - Listar evidencias
router.get(
    '/',
    validateQuery(listEvidenciasSchema),
    evidenciasController.listar
);

// POST /api/evidencias/:ejecucionId/:ordenId/upload - Subir evidencia
router.post(
    '/:ejecucionId/:ordenId/upload',
    roleMiddleware('admin', 'supervisor', 'tecnico'),
    upload.single('file'),
    evidenciasController.upload
);

// GET /api/evidencias/ejecucion/:ejecucionId - Por ejecución
router.get('/ejecucion/:ejecucionId', evidenciasController.getByEjecucion);

// GET /api/evidencias/orden/:ordenId - Por orden
router.get('/orden/:ordenId', evidenciasController.getByOrden);

// GET /api/evidencias/:id - Por ID
router.get('/:id', evidenciasController.getById);

// PATCH /api/evidencias/:id/verificar - Verificar
router.patch(
    '/:id/verificar',
    roleMiddleware('admin', 'supervisor'),
    evidenciasController.verificar
);

// PATCH /api/evidencias/:id/rechazar - Rechazar
router.patch(
    '/:id/rechazar',
    roleMiddleware('admin', 'supervisor'),
    evidenciasController.rechazar
);

// DELETE /api/evidencias/:id - Eliminar
router.delete(
    '/:id',
    roleMiddleware('admin', 'supervisor'),
    evidenciasController.delete
);

export default router;
