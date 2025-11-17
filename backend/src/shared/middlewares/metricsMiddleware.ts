import { Request, Response, NextFunction } from 'express';
import { httpRequestDuration, httpRequestsTotal, httpErrorsTotal } from '../metrics/prometheus';

/**
 * ========================================
 * METRICS MIDDLEWARE
 * ========================================
 * Middleware para recolectar métricas HTTP con Prometheus.
 * Registra duración, total de requests y errores.
 * 
 * @example
 * ```
 * import { metricsMiddleware } from './middlewares/metricsMiddleware';
 * 
 * app.use(metricsMiddleware);
 * ```
 */

/**
 * Middleware de métricas Prometheus
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Iniciar timer
  const start = Date.now();

  // Interceptar finalización de respuesta
  res.on('finish', () => {
    // Calcular duración
    const duration = (Date.now() - start) / 1000; // Convertir a segundos

    // Normalizar ruta (reemplazar IDs por :id)
    const route = normalizeRoute(req.path);

    // Registrar métricas
    httpRequestDuration.observe(
      {
        method: req.method,
        route,
        status_code: res.statusCode.toString(),
      },
      duration
    );

    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode.toString(),
    });

    // Registrar errores (4xx, 5xx)
    if (res.statusCode >= 400) {
      httpErrorsTotal.inc({
        method: req.method,
        route,
        status_code: res.statusCode.toString(),
      });
    }
  });

  next();
}

/**
 * Normalizar ruta para métricas
 * Reemplaza IDs y valores dinámicos por placeholders
 * 
 * @example
 * /api/users/123 -> /api/users/:id
 * /api/orders/abc-def-ghi -> /api/orders/:id
 */
function normalizeRoute(path: string): string {
  return path
    .replace(/\/[0-9a-f]{24}/g, '/:id') // MongoDB ObjectIDs
    .replace(/\/\d+/g, '/:id') // Numeric IDs
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, '/:id'); // UUIDs
}