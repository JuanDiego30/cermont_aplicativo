/**
 * @module Dashboard - Clean Architecture
 */
// Re-export DTOs from separate files
export { DashboardQueryDto } from './dashboard-query.dto';
export {
  DashboardStatsDto,
  TendenciaDto,
  OrdenResumenDto,
  DashboardResponse,
} from './dashboard-response.dto';

// Import types for interface
import type { DashboardQueryDto } from './dashboard-query.dto';
import type { DashboardStatsDto, TendenciaDto, OrdenResumenDto } from './dashboard-response.dto';

// Repository Interface
export const DASHBOARD_REPOSITORY = Symbol('DASHBOARD_REPOSITORY');

export interface IDashboardRepository {
  /**
   * Obtiene estadísticas generales del dashboard
   */
  getStats(filters?: DashboardQueryDto): Promise<DashboardStatsDto>;

  /**
   * Obtiene tendencia de órdenes e ingresos
   * @param dias - Número de días hacia atrás
   */
  getTendencia(dias: number): Promise<TendenciaDto[]>;

  /**
   * Obtiene las últimas órdenes creadas
   * @param limit - Cantidad de órdenes a retornar
   */
  getUltimasOrdenes(limit: number): Promise<OrdenResumenDto[]>;

  /**
   * Obtiene alertas activas del sistema
   */
  getAlertasActivas(): Promise<any[]>;

  /**
   * Obtiene resumen de cierre administrativo
   */
  getResumenCierre(): Promise<any>;
}
