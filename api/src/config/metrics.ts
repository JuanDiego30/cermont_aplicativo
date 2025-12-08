// ============================================
// Prometheus Metrics - Cermont FSM
// ============================================

import promClient from 'prom-client';
import type { Request, Response, NextFunction } from 'express';

// Crear registro
const register = new promClient.Registry();

// Métricas default de Node.js
promClient.collectDefaultMetrics({ register });

// ============================================
// HTTP Metrics
// ============================================

export const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

export const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const httpRequestsInFlight = new promClient.Gauge({
  name: 'http_requests_in_flight',
  help: 'Number of HTTP requests currently being processed',
  registers: [register],
});

// ============================================
// Database Metrics
// ============================================

export const dbConnectionPoolUsed = new promClient.Gauge({
  name: 'db_connection_pool_used',
  help: 'Number of used database connections',
  registers: [register],
});

export const dbConnectionPoolMax = new promClient.Gauge({
  name: 'db_connection_pool_max',
  help: 'Maximum database connections',
  registers: [register],
});

export const dbQueryDuration = new promClient.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Database query duration in seconds',
  labelNames: ['query_type', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

export const dbQueriesTotal = new promClient.Counter({
  name: 'db_queries_total',
  help: 'Total number of database queries',
  labelNames: ['query_type', 'table', 'status'],
  registers: [register],
});

// ============================================
// Cache Metrics
// ============================================

export const cacheHits = new promClient.Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_type'],
  registers: [register],
});

export const cacheMisses = new promClient.Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_type'],
  registers: [register],
});

// ============================================
// Business Metrics
// ============================================

export const ordenesCreated = new promClient.Counter({
  name: 'ordenes_created_total',
  help: 'Total number of orders created',
  labelNames: ['tipo_servicio'],
  registers: [register],
});

export const ordenesCompleted = new promClient.Counter({
  name: 'ordenes_completed_total',
  help: 'Total number of orders completed',
  labelNames: ['tipo_servicio'],
  registers: [register],
});

export const activeUsers = new promClient.Gauge({
  name: 'active_users',
  help: 'Number of currently active users',
  registers: [register],
});

// ============================================
// Middleware
// ============================================

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  httpRequestsInFlight.inc();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path || '/';
    const statusCode = String(res.statusCode);

    httpRequestDuration
      .labels(req.method, route, statusCode)
      .observe(duration);

    httpRequestsTotal
      .labels(req.method, route, statusCode)
      .inc();

    httpRequestsInFlight.dec();
  });

  next();
}

// ============================================
// Metrics Endpoint
// ============================================

export async function metricsEndpoint(_req: Request, res: Response) {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).end(String(error));
  }
}

export { register };
