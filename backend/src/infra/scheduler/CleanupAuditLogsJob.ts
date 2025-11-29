import cron from 'node-cron';
import { auditLogRepository } from '../db/repositories/AuditLogRepository.js';
import { logger } from '../../shared/utils/logger.js';

/**
 * ========================================
 * CLEANUP AUDIT LOGS JOB
 * ========================================
 * Limpia registros de auditoría antiguos.
 */
export class CleanupAuditLogsJob {
  private static readonly KEEP_LOGS_DAYS = parseInt(process.env.AUDIT_LOGS_RETENTION_DAYS || '90', 10);
  private static readonly CRON_EXPRESSION = process.env.CLEANUP_AUDIT_CRON || '0 4 1 * *';

  private static jobStatus = {
    isRunning: false,
    lastRun: null as Date | null,
    lastSuccess: null as Date | null,
    lastError: null as string | null,
    totalCleaned: 0,
  };

  /**
   * Programa el job según la expresión cron configurada
   */
  static schedule(): void {
    cron.schedule(this.CRON_EXPRESSION, async () => {
      await this.run();
    });

    logger.info('✅ Cleanup Audit Logs Job scheduled', {
      cron: this.CRON_EXPRESSION,
      retentionDays: this.KEEP_LOGS_DAYS,
    });
  }

  /**
   * Ejecuta el job de limpieza de logs
   */
  static async run(): Promise<{ success: boolean; deletedCount: number; error?: string }> {
    if (this.jobStatus.isRunning) {
      logger.warn('⚠️ Cleanup Audit Logs Job already running, skipping...');
      return { success: false, deletedCount: 0, error: 'Job already running' };
    }

    this.jobStatus.isRunning = true;
    this.jobStatus.lastRun = new Date();

    try {
      logger.info('🧹 Starting Cleanup Audit Logs Job...', {
        retentionDays: this.KEEP_LOGS_DAYS,
      });

      const result = await auditLogRepository.deleteOlderThan(this.KEEP_LOGS_DAYS);

      this.jobStatus.lastSuccess = new Date();
      this.jobStatus.totalCleaned += result;
      this.jobStatus.lastError = null;

      logger.info('✅ Cleanup Audit Logs Job completed successfully', {
        deletedCount: result,
        retentionDays: this.KEEP_LOGS_DAYS,
      });

      return { success: true, deletedCount: result };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.jobStatus.lastError = errorMessage;

      logger.error('❌ Cleanup Audit Logs Job failed', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      return { success: false, deletedCount: 0, error: errorMessage };
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

