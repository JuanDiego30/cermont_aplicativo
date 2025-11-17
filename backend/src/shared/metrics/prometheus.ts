import promClient from 'prom-client';

/**
 * ========================================
 * PROMETHEUS METRICS
 * ========================================
 * Sistema de métricas para monitoreo con Prometheus/Grafana.
 *
 * Expone métricas en el endpoint `/metrics` en formato Prometheus.
 *
 * @see https://prometheus.io/docs/introduction/overview/
 */

/**
 * Registro global de métricas
 */
export const register = promClient.register;

/**
 * ========================================
 * HTTP METRICS
 * ========================================
 */

/**
 * Histograma de duración de peticiones HTTP
 * Buckets: 100ms, 500ms, 1s, 2s, 5s
 */
export const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duración de peticiones HTTP en segundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

/**
 * Contador total de peticiones HTTP
 */
export const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total de peticiones HTTP',
  labelNames: ['method', 'route', 'status_code'],
});

/**
 * Contador de errores HTTP
 */
export const httpErrorsTotal = new promClient.Counter({
  name: 'http_errors_total',
  help: 'Total de errores HTTP (4xx, 5xx)',
  labelNames: ['method', 'route', 'status_code'],
});

/**
 * ========================================
 * DATABASE METRICS
 * ========================================
 */

/**
 * Histograma de duración de queries a MongoDB
 * Buckets: 10ms, 50ms, 100ms, 500ms, 1s
 */
export const dbQueryDuration = new promClient.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duración de queries a MongoDB',
  labelNames: ['operation', 'collection'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
});

/**
 * Contador de queries a MongoDB
 */
export const dbQueriesTotal = new promClient.Counter({
  name: 'db_queries_total',
  help: 'Total de queries a MongoDB',
  labelNames: ['operation', 'collection', 'status'],
});

/**
 * ========================================
 * BUSINESS METRICS
 * ========================================
 */

/**
 * Gauge de total de órdenes en el sistema por estado
 */
export const ordersTotal = new promClient.Gauge({
  name: 'orders_total',
  help: 'Total de órdenes en el sistema',
  labelNames: ['state'],
});

/**
 * Gauge de total de usuarios activos
 */
export const usersActiveTotal = new promClient.Gauge({
  name: 'users_active_total',
  help: 'Total de usuarios activos',
  labelNames: ['role'],
});

/**
 * Contador de logins exitosos
 */
export const loginSuccessTotal = new promClient.Counter({
  name: 'login_success_total',
  help: 'Total de logins exitosos',
  labelNames: ['role'],
});

/**
 * Contador de logins fallidos
 */
export const loginFailedTotal = new promClient.Counter({
  name: 'login_failed_total',
  help: 'Total de logins fallidos',
  labelNames: ['reason'],
});

/**
 * ========================================
 * JOB METRICS
 * ========================================
 */

/**
 * Contador de ejecuciones de jobs
 */
export const jobExecutionsTotal = new promClient.Counter({
  name: 'job_executions_total',
  help: 'Total de ejecuciones de jobs',
  labelNames: ['job_name', 'status'],
});

/**
 * Histograma de duración de jobs
 */
export const jobDuration = new promClient.Histogram({
  name: 'job_duration_seconds',
  help: 'Duración de ejecución de jobs',
  labelNames: ['job_name'],
  buckets: [1, 5, 10, 30, 60, 120],
});

/**
 * ========================================
 * DEFAULT METRICS
 * ========================================
 * Métricas por defecto de Node.js (CPU, memoria, event loop, etc.)
 */
promClient.collectDefaultMetrics({
  register,
  prefix: 'nodejs_',
});

/**
 * ========================================
 * HELPERS
 * ========================================
 */

/**
 * Obtiene todas las métricas en formato Prometheus
 * @returns String con métricas en formato Prometheus
 */
export async function getMetrics(): Promise<string> {
  return register.metrics();
}

/**
 * Obtiene el content type para el endpoint /metrics
 */
export function getMetricsContentType(): string {
  return register.contentType;
}

/**
 * Limpia todas las métricas (útil para testing)
 */
export function clearMetrics(): void {
  register.clear();
}
