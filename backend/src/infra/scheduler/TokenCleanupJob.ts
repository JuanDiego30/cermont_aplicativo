import cron from 'node-cron';
import { tokenBlacklistRepository } from '../db/repositories/TokenBlacklistRepository.js';
import { refreshTokenRepository } from '../db/repositories/RefreshTokenRepository.js';
import { AuditService } from '../../domain/services/AuditService.js';
import { AuditAction } from '../../domain/entities/AuditLog.js';
import { auditLogRepository } from '../db/repositories/AuditLogRepository.js';
import { logger } from '../../shared/utils/logger.js';

/**
 * TOKEN CLEANUP JOB
 * Limpia tokens expirados del blacklist y refresh tokens.
 * Schedule: Cada 6 horas
 */

export class TokenCleanupJob {
  private static readonly CRON_EXPRESSION = process.env.TOKEN_CLEANUP_CRON || '0 */6 * * *';

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

    logger.info('Token Cleanup Job scheduled', {
      cron: this.CRON_EXPRESSION,
    });
  }

  static getStatus() {
    return { ...this.jobStatus };
  }

  static getCronExpression(): string {
    return this.CRON_EXPRESSION;
  }

  static async run(): Promise<{
    success: boolean;
    blacklistCleaned: number;
    refreshTokensCleaned: number;
    error?: string;
  }> {
    if (this.jobStatus.isRunning) {
      logger.warn('TokenCleanupJob already running, skipping...');
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
      logger.info('Starting TokenCleanupJob...');

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
        reason: 'Deleted ' + blacklistCleaned + ' blacklist and ' + refreshTokensCleaned + ' refresh tokens',
      });

      logger.info('TokenCleanupJob completed', { blacklistCleaned, refreshTokensCleaned });

      return { success: true, blacklistCleaned, refreshTokensCleaned };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.jobStatus.lastError = errorMessage;

      logger.error('TokenCleanupJob failed', {
        error: errorMessage,
        stack: errorStack,
      });

      const auditService = new AuditService(auditLogRepository);
      await auditService.log({
        entityType: 'SYSTEM',
        entityId: 'TOKEN_CLEANUP_ERROR',
        action: AuditAction.DELETE,
        userId: 'SYSTEM',
        ip: '127.0.0.1',
        reason: 'TokenCleanupJob failed: ' + errorMessage,
      });

      return {
        success: false,
        blacklistCleaned: 0,
        refreshTokensCleaned: 0,
        error: errorMessage,
      };
    } finally {
      this.jobStatus.isRunning = false;
    }
  }
}
