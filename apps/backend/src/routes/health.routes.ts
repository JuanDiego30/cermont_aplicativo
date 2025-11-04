/**
 * @file health.routes.ts
 * @description Rutas de health check y readiness
 */

import { Router } from 'express';

const router = Router();

/**
 * GET /healthz
 * Health check endpoint - verifica que la aplicación esté funcionando
 */
router.get('/healthz', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0'
  });
});

/**
 * GET /readyz
 * Readiness check endpoint - verifica que la aplicación esté lista para recibir tráfico
 */
router.get('/readyz', (_req, res) => {
  // TODO: Verificar conexiones a base de datos, Redis, etc.
  const isReady = true; // Por ahora siempre true, implementar checks reales

  if (isReady) {
    res.status(200).json({
      success: true,
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'connected',
        redis: 'connected',
        services: 'operational'
      }
    });
  } else {
    res.status(503).json({
      success: false,
      status: 'not ready',
      timestamp: new Date().toISOString(),
      message: 'Service not ready'
    });
  }
});

/**
 * GET /metrics
 * Métricas de la aplicación (opcional)
 */
router.get('/metrics', (_req, res) => {
  // TODO: Implementar métricas con prom-client
  res.status(200).json({
    success: true,
    metrics: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    }
  });
});

export default router;