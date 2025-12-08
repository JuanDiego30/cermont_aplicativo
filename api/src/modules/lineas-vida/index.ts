// ============================================
// INSPECCIÓN LÍNEAS DE VIDA ROUTES - Cermont FSM
// Formato OPE-006 - Inspección de líneas de vida verticales
// ============================================

import { Router } from 'express';
import { lineasVidaController } from './lineas-vida.controller.js';
import { authMiddleware, roleMiddleware } from '../auth/auth.middleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// ==========================================
// RUTAS DE CONSULTA
// ==========================================

// Obtener template de inspección vacío
router.get('/template', lineasVidaController.getTemplate);

// Obtener estadísticas generales
router.get('/estadisticas', lineasVidaController.getEstadisticas);

// Listar inspecciones (con filtros opcionales)
router.get('/', lineasVidaController.list);

// Obtener inspección por número de línea
router.get('/numero/:numeroLinea', lineasVidaController.getByNumeroLinea);

// Obtener inspección por ID
router.get('/:id', lineasVidaController.getById);

// Obtener reporte de inspección
router.get('/:id/reporte', lineasVidaController.getReporte);

// ==========================================
// RUTAS DE MODIFICACIÓN
// ==========================================

// Crear nueva inspección
router.post('/', roleMiddleware('admin', 'supervisor', 'tecnico'), lineasVidaController.create);

// Actualizar inspección
router.patch('/:id', roleMiddleware('admin', 'supervisor', 'tecnico'), lineasVidaController.update);

// Eliminar inspección (solo admin y supervisor)
router.delete('/:id', roleMiddleware('admin', 'supervisor'), lineasVidaController.delete);

export default router;
