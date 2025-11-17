import cron from 'node-cron';
import { orderRepository } from '../infra/db/repositories/OrderRepository';
import { AuditService } from '../domain/services/AuditService';
import { AuditAction } from '../domain/entities/AuditLog';
import { auditLogRepository } from '../infra/db/repositories/AuditLogRepository';
import { logger } from '../shared/utils/logger';

/**
 * ========================================
 * ARCHIVE ORDERS JOB
 * ========================================
 * Archiva automáticamente órdenes completadas hace más de 30 días.
 *
 * **Schedule:** Todos los días a las 2:00 AM
 * **Cron:** `0 2 * * *`
 *
 * @example
 * ```
 * import { ArchiveOrdersJob } from './jobs/ArchiveOrdersJob';
 * ArchiveOrdersJob.schedule();
 * ```
 */

export class ArchiveOrdersJob {
  /**
   * Días después de completada para archivar (configurable)
   */
  private static readonly ARCHIVE_AFTER_DAYS = parseInt(
    process.env.ARCHIVE_ORDERS_AFTER_DAYS || '30',
    10
  );

  /**
   * Expresión cron para la ejecución
   * Default: 2:00 AM diario
   */
  private static readonly CRON_EXPRESSION = process.env.ARCHIVE_ORDERS_CRON || '0 2 * * *';

  /**
   * Estado del job (para monitoring)
   */
  private static jobStatus: {
    isRunning: boolean;
    lastRun: Date | null;
    lastSuccess: Date | null;
    lastError: string | null;
    totalArchived: number;
  } = {
    isRunning: false,
    lastRun: null,
    lastSuccess: null,
    lastError: null,
    totalArchived: 0,
  };

  /**
   * Programa el job para ejecución automática
   */
  static schedule(): void {
    cron.schedule(this.CRON_EXPRESSION, async () => {
      await this.run();
    });

    logger.info('✅ Archive Orders Job scheduled', {
      cron: this.CRON_EXPRESSION,
      archiveAfterDays: this.ARCHIVE_AFTER_DAYS,
    });
  }

  /**
   * Ejecuta el job manualmente (útil para testing)
   */
  static async run(): Promise<{
    success: boolean;
    archivedCount: number;
    error?: string;
  }> {
    // Prevenir ejecuciones concurrentes
    if (this.jobStatus.isRunning) {
      logger.warn('⚠️  Archive Orders Job already running, skipping...');
      return { success: false, archivedCount: 0, error: 'Job already running' };
    }

    this.jobStatus.isRunning = true;
    this.jobStatus.lastRun = new Date();

    try {
      logger.info('🗂️  Starting Archive Orders Job...', {
        archiveAfterDays: this.ARCHIVE_AFTER_DAYS,
      });

      // Calcular fecha límite
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.ARCHIVE_AFTER_DAYS);

      // Archivar órdenes usando repositorio
      const archivedOrders = await orderRepository.archiveCompleted(cutoffDate);

      // Actualizar estadísticas
      this.jobStatus.lastSuccess = new Date();
      this.jobStatus.totalArchived += archivedOrders;
      this.jobStatus.lastError = null;

      // Registrar en auditoría
      const auditService = new AuditService(auditLogRepository);
      await auditService.log({
        entityType: 'SYSTEM',
        entityId: 'ARCHIVE_ORDERS_JOB',
        action: AuditAction.CREATE, // TODO: Add SYSTEM_MAINTENANCE to AuditAction
        userId: 'SYSTEM',
        ip: '127.0.0.1',
        reason: `Archive orders job: ${archivedOrders} orders archived`,
      });

      logger.info('✅ Archive Orders Job completed successfully', {
        archivedCount: archivedOrders,
        cutoffDate: cutoffDate.toISOString(),
      });

      return { success: true, archivedCount: archivedOrders };
    } catch (error: any) {
      this.jobStatus.lastError = error.message;

      logger.error('❌ Archive Orders Job failed', {
        error: error.message,
        stack: error.stack,
      });

      // Registrar error en auditoría
      const auditService = new AuditService(auditLogRepository);
      await auditService.log({
        entityType: 'SYSTEM',
        entityId: 'ARCHIVE_ORDERS_JOB_ERROR',
        action: AuditAction.DELETE, // TODO: Add SYSTEM_ERROR to AuditAction
        userId: 'SYSTEM',
        ip: '127.0.0.1',
        reason: `Archive orders job error: ${error.message}`,
      });

      return { success: false, archivedCount: 0, error: error.message };
    } finally {
      this.jobStatus.isRunning = false;
    }
  }

  /**
   * Obtiene el estado actual del job (para monitoring)
   */
  static getStatus() {
    return { ...this.jobStatus };
  }

  static getCronExpression(): string {
    return this.CRON_EXPRESSION;
  }
}
