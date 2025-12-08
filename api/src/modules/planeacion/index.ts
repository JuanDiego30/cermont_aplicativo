// ============================================
// PLANEACIÓN ROUTES - Cermont FSM
// ============================================

import { Router } from 'express';
import { planeacionController } from './planeacion.controller.js';
import { authMiddleware, roleMiddleware } from '../auth/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// ==========================================
// RUTAS DE PLANEACIÓN
// ==========================================

// Listar planeaciones (con filtros opcionales)
router.get('/', planeacionController.list);

// Obtener planeación por ID
router.get('/:id', planeacionController.getById);

// Obtener planeación de una orden específica
router.get('/orden/:ordenId', planeacionController.getByOrdenId);

// Crear nueva planeación
router.post('/', roleMiddleware('admin', 'supervisor', 'tecnico'), planeacionController.create);

// Actualizar planeación
router.patch('/:id', roleMiddleware('admin', 'supervisor', 'tecnico'), planeacionController.update);

// ==========================================
// ACCIONES DE FLUJO DE TRABAJO
// ==========================================

// Enviar a revisión (técnico envía para aprobación)
router.post('/:id/enviar-revision', roleMiddleware('admin', 'supervisor', 'tecnico'), planeacionController.enviarARevision);

// Aprobar planeación (solo supervisores y admin)
router.post('/:id/aprobar', roleMiddleware('admin', 'supervisor'), planeacionController.aprobar);

// Rechazar planeación (solo supervisores y admin)
router.post('/:id/rechazar', roleMiddleware('admin', 'supervisor'), planeacionController.rechazar);

// Iniciar ejecución
router.post('/:id/iniciar', roleMiddleware('admin', 'supervisor', 'tecnico'), planeacionController.iniciarEjecucion);

// Completar planeación
router.post('/:id/completar', roleMiddleware('admin', 'supervisor', 'tecnico'), planeacionController.completar);

// Cancelar planeación (solo supervisores y admin)
router.post('/:id/cancelar', roleMiddleware('admin', 'supervisor'), planeacionController.cancelar);

// Eliminar planeación (solo admin)
router.delete('/:id', roleMiddleware('admin'), planeacionController.delete);

export default router;
