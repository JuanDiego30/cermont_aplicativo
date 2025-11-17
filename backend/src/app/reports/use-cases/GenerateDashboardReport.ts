/**
 * Use Case: Generar reporte de dashboard
 * Resuelve: Reporte consolidado con KPIs y m�tricas
 * 
 * @file backend/src/app/reports/use-cases/GenerateDashboardReport.ts
 */

import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import { GetOrderStats, type OrderStats } from '../../orders/use-cases/GetOrderStats.js';
import { logger } from '../../../shared/utils/logger.js';

/**
 * Filtros para el reporte
 */
export interface DashboardReportFilters {
  startDate?: Date;
  endDate?: Date;
  format?: 'JSON' | 'PDF';
}

/**
 * Datos del reporte
 */
export interface DashboardReportData {
  stats: OrderStats;
  period: {
    start: Date;
    end: Date;
  };
  generatedAt: Date;
}

/**
 * Use Case: Generar Reporte de Dashboard
 * @class GenerateDashboardReport
 */
export class GenerateDashboardReport {
  private readonly getOrderStats: GetOrderStats;

  constructor(private readonly orderRepository: IOrderRepository) {
    this.getOrderStats = new GetOrderStats(orderRepository);
  }

  async execute(filters: DashboardReportFilters = {}): Promise<DashboardReportData> {
    try {
      logger.info('[GenerateDashboardReport] Generando reporte', { filters });

      // 1. Establecer per�odo por defecto (�ltimo mes)
      const endDate = filters.endDate || new Date();
      const startDate = filters.startDate || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

      // 2. Obtener estad�sticas
      const stats = await this.getOrderStats.execute({
        startDate,
        endDate,
      });

      // 3. Preparar datos del reporte
      const reportData: DashboardReportData = {
        stats,
        period: {
          start: startDate,
          end: endDate,
        },
        generatedAt: new Date(),
      };

      logger.info('[GenerateDashboardReport] Reporte generado', {
        totalOrders: stats.total,
        period: `${startDate.toISOString()} - ${endDate.toISOString()}`,
      });

      // 4. Si se solicita PDF, generar (futuro)
      if (filters.format === 'PDF') {
        // TODO: Implementar generaci�n de PDF del dashboard
        logger.warn('[GenerateDashboardReport] PDF generation not implemented yet');
      }

      return reportData;
    } catch (error) {
      logger.error('[GenerateDashboardReport] Error inesperado', {
        error: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }
}
