/**
 * Main Router
 * Centraliza todas las rutas de la aplicación
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
import archivesRoutes from './archives.routes.js';
import billingRoutes from './billing.routes.js';
import weatherRoutes from './weather.routes.js';
import assistantRoutes from './assistant.routes.js';
import formTemplatesRoutes from './form-templates.routes.js';
import jobsRoutes from './jobs.routes.js';
import notificationsRoutes from './notifications.routes.js';
import costBreakdownRoutes from './cost-breakdown.routes.js';

const router = Router();

// ============================================================================
// System Endpoints
// ============================================================================

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * API version endpoint
 * GET /api/version
 */
router.get('/version', (req: Request, res: Response) => {
  res.json({
    version: '1.0.0',
    name: 'CERMONT API',
    description: 'Sistema de Gestión de Órdenes de Trabajo',
  });
});

// ============================================================================
// Core Features
// ============================================================================

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);

// ============================================================================
// Business Features
// ============================================================================

router.use('/orders', ordersRoutes);
router.use('/workplans', workplansRoutes);
router.use('/evidences', evidencesRoutes);
router.use('/kits', kitsRoutes);
router.use('/checklists', checklistsRoutes);

// ============================================================================
// Reports & Analytics
// ============================================================================

router.use('/reports', reportsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/billing', billingRoutes);
router.use('/cost-breakdown', costBreakdownRoutes);

// ============================================================================
// External Services & Utilities
// ============================================================================

router.use('/weather', weatherRoutes);
router.use('/assistant', assistantRoutes);

// ============================================================================
// Administrative
// ============================================================================

router.use('/jobs', jobsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/archives', archivesRoutes);
router.use('/form-templates', formTemplatesRoutes);

// ============================================================================
// 404 Not Found Handler
// ============================================================================

router.use((req: Request, res: Response) => {
  res.status(404).json({
    type: 'https://httpstatuses.com/404',
    title: 'Not Found',
    status: 404,
    detail: `Endpoint ${req.originalUrl} no encontrado`,
  });
});

export default router;
