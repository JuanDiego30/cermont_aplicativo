/**
 * Use Case: Generar reporte de dashboard
 * 
 * Genera un reporte consolidado con KPIs y métricas de órdenes para
 * un período dado, con opción de exportar en PDF y almacenar historial.
 * 
 * @file backend/src/app/reports/use-cases/GenerateDashboardReport.ts
 */

import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import type { IPdfGeneratorService } from '../../../domain/services/IPdfGeneratorService.js';
import type { IFileStorageService } from '../../../domain/services/IFileStorageService.js';
import type { ICacheService } from '../../../domain/services/ICacheService.js';
import { GetOrderStatsUseCase, type OrderStats } from '../../orders/use-cases/GetOrderStats.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';

const LOG_CONTEXT = {
  USE_CASE: '[GenerateDashboardReportUseCase]',
} as const;

interface DashboardReportFilters {
  startDate?: Date;
  endDate?: Date;
  format?: 'JSON' | 'PDF';
  generatedBy: string;
  ip?: string;
  userAgent?: string;
}

interface DashboardReportData {
  stats: OrderStats;
  period: {
    start: Date;
    end: Date;
  };
  generatedAt: Date;
  reportFilePath?: string;
  fileSize?: number;
}

interface AuditContext {
  ip: string;
  userAgent: string;
}

export class GenerateDashboardReportUseCase {
  private readonly getOrderStats: GetOrderStatsUseCase;

  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly pdfGeneratorService: IPdfGeneratorService,
    private readonly fileStorageService: IFileStorageService,
    private readonly auditService: AuditService,
    private readonly cacheService: ICacheService
  ) {
    this.getOrderStats = new GetOrderStatsUseCase(orderRepository, cacheService);
  }

  async execute(filters: DashboardReportFilters): Promise<DashboardReportData> {
    this.validateInput(filters);

    // 1. Establecer período por defecto (últimos 30 días)
    const now = new Date();
    const endDate = filters.endDate || now;
    const startDate = filters.startDate || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (endDate < startDate) {
      throw new Error('La fecha de fin debe ser posterior o igual a la de inicio');
    }

    // 2. Obtener estadísticas
    const statsResult = await this.getOrderStats.execute({
      startDate,
      endDate,
    });

    const reportData: DashboardReportData = {
      stats: statsResult.stats,
      period: {
        start: startDate,
        end: endDate,
      },
      generatedAt: now,
    };

    let pdfBuffer: Buffer | undefined;
    let filePath: string | undefined;
    let fileSize: number | undefined;

    // 3. Generar PDF y almacenar si se solicita
    if (filters.format === 'PDF') {
      // Mapear OrderStats a la estructura esperada por IPdfGeneratorService
      const pdfStats = {
        totalOrders: statsResult.stats.total,
        completedOrders: statsResult.stats.stateGroups.completed,
        pendingOrders: statsResult.stats.stateGroups.pending + statsResult.stats.stateGroups.inProgress,
        byState: Object.fromEntries(
          Object.entries(statsResult.stats.byState).map(([k, v]) => [k, v])
        ) as Record<string, number>,
        byMonth: [] as Array<{ month: string; count: number }>, // TODO: calcular por mes si es necesario
      };
      pdfBuffer = await this.pdfGeneratorService.generateDashboardReport({
        stats: pdfStats,
        period: { start: startDate, end: endDate },
        generatedAt: now,
      });
      if (pdfBuffer) {
        fileSize = pdfBuffer.length;
        const fileName = `dashboard-report-${startDate.toISOString().slice(0, 10)}-${endDate.toISOString().slice(0, 10)}.pdf`;
        filePath = await this.fileStorageService.upload(fileName, pdfBuffer, 'application/pdf');
        reportData.reportFilePath = filePath;
        reportData.fileSize = fileSize;
      }
    }

    // 4. Registrar en auditoría
    const auditContext = this.extractAuditContext(filters);
    await this.logDashboardReport(
      reportData,
      filters.generatedBy,
      filters.format === 'PDF' ? filePath : undefined,
      auditContext
    );

    logger.info(`${LOG_CONTEXT.USE_CASE} Reporte de dashboard generado`, {
      period: `${startDate.toISOString()} - ${endDate.toISOString()}`,
      format: filters.format || 'JSON',
      reportFilePath: filePath,
      generatedBy: filters.generatedBy,
    });

    return reportData;
  }

  private validateInput(filters: DashboardReportFilters): void {
    if (!filters.generatedBy || !filters.generatedBy.trim()) {
      throw new Error('Debe especificar el usuario que genera el reporte');
    }
    if (filters.format && !['JSON', 'PDF'].includes(filters.format)) {
      throw new Error('Formato de reporte inválido');
    }
  }

  private extractAuditContext(input: DashboardReportFilters): AuditContext {
    return {
      ip: input.ip || 'unknown',
      userAgent: input.userAgent || 'unknown',
    };
  }

  private async logDashboardReport(
    reportData: DashboardReportData,
    userId: string,
    filePath: string | undefined,
    auditContext: AuditContext
  ): Promise<void> {
    try {
      await this.auditService.log({
        entityType: 'DashboardReport',
        entityId: reportData.period.start.toISOString() + '_' + reportData.period.end.toISOString(),
        action: AuditAction.GENERATE_DASHBOARD_REPORT,
        userId,
        before: null,
        after: {
          reportGenerated: true,
          filePath,
          totalOrders: reportData.stats.total,
          periodStart: reportData.period.start,
          periodEnd: reportData.period.end,
          generatedAt: reportData.generatedAt,
        },
        ip: auditContext.ip,
        userAgent: auditContext.userAgent,
        reason: `Reporte generado en formato ${filePath ? 'PDF' : 'JSON'}`,
      });
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error registrando auditoría (no crítico)`, {
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }
}

