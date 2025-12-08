/**
 * Rutas del dashboard para Cermont. Todas las rutas requieren autenticación via authMiddleware
 * y autorización basada en roles (solo admin y supervisor). Cada ruta mapea a un método
 * del controller que retorna datos JSON para visualización en gráficos y métricas del panel.
 * Soporta query parameters (dias) para filtrado temporal de datos.
 */

import { Router } from 'express';
import { dashboardController } from './dashboard.controller.js';
import { authMiddleware, roleMiddleware } from '../auth/auth.middleware.js';

const router = Router();

// Autenticación requerida
router.use(authMiddleware);

// Solo admin y supervisor pueden ver el dashboard
router.use(roleMiddleware('admin', 'supervisor'));

// GET /api/dashboard/metricas
router.get('/metricas', dashboardController.getMetricas);

// GET /api/dashboard/ordenes-estado
router.get('/ordenes-estado', dashboardController.getOrdenesEstado);

// GET /api/dashboard/analisis-costos
router.get('/analisis-costos', dashboardController.getAnalisisCostos);

// GET /api/dashboard/ordenes-vencer
router.get('/ordenes-vencer', dashboardController.getOrdenesPorVencer);

// GET /api/dashboard/actividad
router.get('/actividad', dashboardController.getActividadReciente);

// GET /api/dashboard/ordenes-prioridad
router.get('/ordenes-prioridad', dashboardController.getOrdenesPorPrioridad);

// GET /api/dashboard/tecnicos
router.get('/tecnicos', dashboardController.getResumenTecnicos);

export default router;

