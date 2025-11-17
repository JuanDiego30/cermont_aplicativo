import cron from 'node-cron';
import { auditLogRepository } from '../infra/db/repositories/AuditLogRepository.js';
import { logger } from '../shared/utils/logger.js';

/**
 * ========================================
 * CLEANUP AUDIT LOGS JOB
 * ========================================
 * Elimina logs de auditoría antiguos (más de 6 meses).
 *
 * **Schedule:** Primer día del mes a las 4:00 AM
 * **Cron:** `0 4 1 * *`
 */

export class CleanupAuditLogsJob {
  private static readonly KEEP_LOGS_DAYS = parseInt(
    process.env.AUDIT_LOGS_RETENTION_DAYS || '180',
    10
  ); // 6 meses

  private static readonly CRON_EXPRESSION = process.env.CLEANUP_AUDIT_CRON || '0 4 1 * *';

  private static jobStatus: {
    isRunning: boolean;
    lastRun: Date | null;
    lastSuccess: Date | null;
    lastError: string | null;
    totalCleaned: number;
  } = {
    isRunning: false,
    lastRun: null,
    lastSuccess: null,
    lastError: null,
    totalCleaned: 0,
  };

  static schedule(): void {
    cron.schedule(this.CRON_EXPRESSION, async () => {
      await this.run();
    });

    logger.info('✅ Cleanup Audit Logs Job scheduled', {
      cron: this.CRON_EXPRESSION,
      retentionDays: this.KEEP_LOGS_DAYS,
    });
  }

  static async run(): Promise<{
    success: boolean;
    deletedCount: number;
    error?: string;
  }> {
    if (this.jobStatus.isRunning) {
      logger.warn('⚠️  Cleanup Audit Logs Job already running, skipping...');
      return { success: false, deletedCount: 0, error: 'Job already running' };
    }

    this.jobStatus.isRunning = true;
    this.jobStatus.lastRun = new Date();

    try {
      logger.info('🧹 Starting Cleanup Audit Logs Job...', {
        retentionDays: this.KEEP_LOGS_DAYS,
      });

      const result = await auditLogRepository.deleteOlderThan(90);

      this.jobStatus.lastSuccess = new Date();
      this.jobStatus.totalCleaned += result;
      this.jobStatus.lastError = null;

      logger.info('✅ Cleanup Audit Logs Job completed successfully', {
        deletedCount: result,
        retentionDays: this.KEEP_LOGS_DAYS,
      });

      return { success: true, deletedCount: result };
    } catch (error: any) {
      this.jobStatus.lastError = error.message;

      logger.error('❌ Cleanup Audit Logs Job failed', {
        error: error.message,
        stack: error.stack,
      });

      return { success: false, deletedCount: 0, error: error.message };
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