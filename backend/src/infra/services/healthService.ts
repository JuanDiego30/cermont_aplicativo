/**
 * ========================================
 * HEALTH CHECK SERVICES
 * ========================================
 * Servicios para verificar el estado de salud de los componentes del sistema.
 * @file backend/src/infra/services/healthService.ts
 */

import { auditLogRepository } from '../db/repositories/AuditLogRepository.js';
import { tokenBlacklistRepository } from '../db/repositories/TokenBlacklistRepository.js';
import { refreshTokenRepository } from '../db/repositories/RefreshTokenRepository.js';

export interface HealthStatus {
  status: 'ok' | 'error';
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export class HealthCheckService {
  
  /**
   * Verifica la salud general del sistema (Database connectivity via Repos)
   */
  async checkSystemHealth(): Promise<HealthStatus> {
    const auditHealth = await this.checkAuditServiceHealth();
    const tokenHealth = await this.checkTokenServiceHealth();

    const isHealthy = auditHealth.status === 'ok' && tokenHealth.status === 'ok';

    return {
      status: isHealthy ? 'ok' : 'error',
      message: isHealthy ? 'All systems operational' : 'System degraded',
      timestamp: new Date().toISOString(),
      details: {
        auditService: auditHealth,
        tokenService: tokenHealth,
      },
    };
  }

  /**
   * Verifica que el servicio de auditoría esté respondiendo
   */
  async checkAuditServiceHealth(): Promise<HealthStatus> {
    try {
      // Intentar una lectura ligera (LIMIT 1)
      await auditLogRepository.findRecent(1);
      return {
        status: 'ok',
        message: 'Audit service operational',
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        status: 'error',
        message: `Audit service unreachable: ${message}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Verifica que los repositorios de autenticación (Tokens) estén respondiendo
   */
  async checkTokenServiceHealth(): Promise<HealthStatus> {
    try {
      // Ejecutar verificaciones en paralelo para fail-fast
      const [blacklistCount, refreshTokenCount] = await Promise.all([
        tokenBlacklistRepository.countActive(),
        // Usamos un contador global o verificación de conexión simple en lugar de un ID hardcodeado
        // Asumiendo que existe un método countAll o similar, si no, countActive con un dummy válido
        refreshTokenRepository.countActive('00000000-0000-0000-0000-000000000000'), 
      ]);

      return {
        status: 'ok',
        message: 'Token service operational',
        timestamp: new Date().toISOString(),
        details: {
          blacklistAccessible: true,
          refreshTokenAccessible: true,
          metrics: {
            activeBlacklistedTokens: blacklistCount,
            // refreshTokenRecords: refreshTokenCount, // Opcional, puede ser info sensible
          },
        },
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        status: 'error',
        message: `Token service unreachable: ${message}`,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Singleton export
export const healthCheckService = new HealthCheckService();
