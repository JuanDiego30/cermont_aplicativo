/**
 * Routes Index (October 2025)
 * @description Punto de entrada de todas las rutas
 */

import express from 'express';
import authRoutes from './auth.routes.js';
import usersRoutes from './users.routes.js';
import ordersRoutes from './orders.routes.js';
import workplansRoutes from './workplans.routes.js';
import uploadRoutes from './upload.routes.js';
// ✅ AGREGAR: Importar auditLogRoutes
import auditLogRoutes from './auditLog.routes.js';
import systemRoutes from './system.routes.js';
import * as adminRoutesModule from './admin.routes.js'; // NUEVO - import safe

const router = express.Router();

// Rutas públicas
router.use('/auth', authRoutes);

// Rutas protegidas
router.use('/users', usersRoutes);
router.use('/orders', ordersRoutes);
router.use('/workplans', workplansRoutes);
router.use('/upload', uploadRoutes);
// ✅ AGREGAR: Ruta de audit logs
router.use('/audit-logs', auditLogRoutes);
// ✅ AGREGAR ruta
router.use('/system', systemRoutes);

// NUEVO: Rutas de administración (soporte a módulos que exporten default o named)
const adminRoutes = adminRoutesModule.default || adminRoutesModule.router || adminRoutesModule;
// If adminRoutes is a module object (not directly a router), we must extract the router
const adminRouter = (adminRoutes && adminRoutes.use) ? adminRoutes : (adminRoutes.router || adminRoutes.default || adminRoutes);
router.use('/admin', adminRouter);

// Health check específico de la API
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API v1 is operational',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

export default router;
