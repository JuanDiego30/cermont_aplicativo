import { Router } from 'express';
import { reportesController } from './reportes.controller.js';
import { authMiddleware, roleMiddleware } from '../auth/auth.middleware.js';

const router = Router();

// Autenticación requerida
router.use(authMiddleware);

// Solo admin y supervisor pueden generar reportes
router.use(roleMiddleware('admin', 'supervisor'));

// GET /api/reportes/informe-tecnico/:ordenId
router.get('/informe-tecnico/:ordenId', reportesController.generarInformeTecnico);

// GET /api/reportes/informe-tecnico/:ordenId/preview
router.get('/informe-tecnico/:ordenId/preview', reportesController.previewInformeTecnico);

// GET /api/reportes/acta-entrega/:ordenId
router.get('/acta-entrega/:ordenId', reportesController.generarActaEntrega);

// GET /api/reportes/costos
router.get('/costos', reportesController.generarReporteCostos);

// GET /api/reportes/productividad
router.get('/productividad', reportesController.generarReporteProductividad);

export default router;
