import cron from 'node-cron';
import { orderRepository } from '../db/repositories/OrderRepository.js';
import { AuditService } from '../../domain/services/AuditService.js';
import { AuditAction } from '../../domain/entities/AuditLog.js';
import { auditLogRepository } from '../db/repositories/AuditLogRepository.js';
import { logger, getErrorMessage } from '../../shared/utils/index.js';

/**
 * ========================================
 * ARCHIVE ORDERS JOB
 * ========================================
 * Archiva automáticamente órdenes completadas hace más de 30 días.
 */
export class ArchiveOrdersJob {
  private static readonly ARCHIVE_AFTER_DAYS = parseInt(process.env.ARCHIVE_ORDERS_AFTER_DAYS || '30', 10);
  private static readonly CRON_EXPRESSION = process.env.ARCHIVE_ORDERS_CRON || '0 2 * * *';
  
  // Dependencias (Lazy injection o Singleton pattern simple)
  private static auditService = new AuditService(auditLogRepository);

  private static jobStatus = {
    isRunning: false,
    lastRun: null as Date | null,
    lastSuccess: null as Date | null,
    lastError: null as string | null,
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
   * Ejecuta el job manualmente
   */
  static async run(): Promise<{ success: boolean; archivedCount: number; error?: string }> {
    if (this.jobStatus.isRunning) {
      logger.warn('⚠️ Archive Orders Job already running, skipping...');
      return { success: false, archivedCount: 0, error: 'Job already running' };
    }

    this.jobStatus.isRunning = true;
    this.jobStatus.lastRun = new Date();

    try {
      logger.info('🗂️ Starting Archive Orders Job...', {
        archiveAfterDays: this.ARCHIVE_AFTER_DAYS,
      });

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.ARCHIVE_AFTER_DAYS);

      // Ejecutar archivado
      const archivedOrders = await orderRepository.archiveCompleted(cutoffDate);

      // Actualizar estado
      this.jobStatus.lastSuccess = new Date();
      this.jobStatus.totalArchived += archivedOrders;
      this.jobStatus.lastError = null;

      // Auditoría de éxito
      await this.auditService.log({
        entityType: 'SYSTEM',
        entityId: 'ARCHIVE_ORDERS_JOB',
        action: AuditAction.UPDATE, // Usamos UPDATE o un tipo genérico existente
        userId: 'SYSTEM',
        ip: 'LOCAL', // Constante más semántica
        reason: `Archive orders job: ${archivedOrders} orders archived`,
      });

      logger.info('✅ Archive Orders Job completed successfully', {
        archivedCount: archivedOrders,
        cutoffDate: cutoffDate.toISOString(),
      });

      return { success: true, archivedCount: archivedOrders };

    } catch (error: unknown) {
      const errorMsg = getErrorMessage(error);
      this.jobStatus.lastError = errorMsg;
      
      logger.error('❌ Archive Orders Job failed', {
        error: errorMsg,
      });

      // Auditoría de error
      await this.auditService.log({
        entityType: 'SYSTEM',
        entityId: 'ARCHIVE_ORDERS_JOB_ERROR',
        action: AuditAction.DELETE, // O mantener DELETE si representa fallo crítico/limpieza
        userId: 'SYSTEM',
        ip: 'LOCAL',
        reason: `Archive orders job error: ${errorMsg}`,
      });

      return { success: false, archivedCount: 0, error: errorMsg };
    } finally {
      this.jobStatus.isRunning = false;
    }
  }

  static getStatus() {
    return { ...this.jobStatus };
  }

  static getCronExpression(): string {
    return this.CRON_EXPRESSION;
  }
}

