/**
 * Router Principal
 * Agrega todas las rutas de la aplicación
 *
 * @file backend/src/infra/http/routes/index.ts
 */

import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes.js';
import ordersRoutes from './orders.routes.js';
import workplansRoutes from './workplans.routes.js';
import evidencesRoutes from './evidences.routes.js';
import reportsRoutes from './reports.routes.js';
import usersRoutes from './users.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import kitsRoutes from './kits.routes.js';
import checklistsRoutes from './checklists.routes.js';

const router = Router();

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * API Version
 */
router.get('/version', (req, res) => {
  res.json({
    version: '1.0.0',
    name: 'CERMONT API',
    description: 'Sistema de Gestión de Órdenes de Trabajo',
  });
});

/**
 * Montar rutas
 */
router.use('/auth', authRoutes);
router.use('/orders', ordersRoutes);
router.use('/workplans', workplansRoutes);
router.use('/evidences', evidencesRoutes);
router.use('/reports', reportsRoutes);
router.use('/users', usersRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/kits', kitsRoutes);
router.use('/checklists', checklistsRoutes);

/**
 * Ruta 404 para endpoints no encontrados
 */
router.use((req: Request, res: Response) => {
  res.status(404).json({
    type: 'https://httpstatuses.com/404',
    title: 'Not Found',
    status: 404,
    detail: `Endpoint ${req.originalUrl} no encontrado`,
  });
});

export default router;