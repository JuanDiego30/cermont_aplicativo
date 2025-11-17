import { AuditService } from '../domain/services/AuditService.js';
import { auditLogRepository } from '../infra/db/repositories/AuditLogRepository.js';
import { AuditAction } from '../domain/entities/AuditLog.js';
import { refreshTokenRepository } from '../infra/db/repositories/RefreshTokenRepository.js';
import { tokenBlacklistRepository } from '../infra/db/repositories/TokenBlacklistRepository.js';
import { logger } from '../shared/utils/logger.js';

/**
 * ========================================
 * TOKEN CLEANUP JOB
 * ========================================
 * Limpia tokens expirados de refresh y blacklist.
 *
 * **Schedule:** Todos los días a las 3:00 AM
 * **Cron:** `0 3 * * *`
 */
export class TokenCleanupJob {
  private static readonly CRON_EXPRESSION = process.env.CLEANUP_TOKENS_CRON || '0 3 * * *';

  private static jobStatus = {
    isRunning: false,
    lastRun: null as Date | null,
    lastSuccess: null as Date | null,
    lastError: null as string | null,
    totalCleaned: 0,
  };

  static getStatus() {
    return { ...this.jobStatus };
  }

  static getCronExpression(): string {
    return this.CRON_EXPRESSION;
  }

  static async run() {
    if (this.jobStatus.isRunning) {
      logger.warn('⚠️  TokenCleanupJob already running, skipping...');
      return {
        success: false,
        blacklistCleaned: 0,
        refreshTokensCleaned: 0,
        error: 'Job already running',
      };
    }

    this.jobStatus.isRunning = true;
    this.jobStatus.lastRun = new Date();

    try {
      logger.info('🧹 Starting TokenCleanupJob...');

      const [blacklistCleaned, refreshTokensCleaned] = await Promise.all([
        tokenBlacklistRepository.deleteExpired(),
        refreshTokenRepository.deleteExpired(),
      ]);

      this.jobStatus.lastSuccess = new Date();
      this.jobStatus.lastError = null;
      this.jobStatus.totalCleaned += blacklistCleaned + refreshTokensCleaned;

      const auditService = new AuditService(auditLogRepository);
      await auditService.log({
        entityType: 'SYSTEM',
        entityId: 'TOKEN_CLEANUP',
        action: AuditAction.CREATE,
        userId: 'SYSTEM',
        ip: '127.0.0.1',
        reason: `Deleted ${blacklistCleaned} blacklist and ${refreshTokensCleaned} refresh tokens`,
      });

      logger.info('✅ TokenCleanupJob completed', { blacklistCleaned, refreshTokensCleaned });

      return { success: true, blacklistCleaned, refreshTokensCleaned };
    } catch (error: any) {
      this.jobStatus.lastError = error.message;
      logger.error('❌ TokenCleanupJob failed', { error: error.message, stack: error.stack });

      const auditService = new AuditService(auditLogRepository);
      await auditService.log({
        entityType: 'SYSTEM',
        entityId: 'TOKEN_CLEANUP_ERROR',
        action: AuditAction.DELETE,
        userId: 'SYSTEM',
        ip: '127.0.0.1',
        reason: `TokenCleanupJob failed: ${error.message}`,
      });

      return { success: false, blacklistCleaned: 0, refreshTokensCleaned: 0, error: error.message };
    } finally {
      this.jobStatus.isRunning = false;
    }
  }
}