import { auditLogRepository } from '../db/repositories/AuditLogRepository.js';
import { tokenBlacklistRepository } from '../db/repositories/TokenBlacklistRepository.js';
import { refreshTokenRepository } from '../db/repositories/RefreshTokenRepository.js';

/**
 * ========================================
 * HEALTH CHECK SERVICES
 * ========================================
 * Servicios para verificar el estado de salud de los componentes del sistema.
 */

/**
 * Verifica que el servicio de auditor�a est� funcionando correctamente
 */
export async function checkAuditServiceHealth(): Promise<{
  status: 'ok' | 'error';
  message: string;
}> {
  try {
    // Intentar obtener logs recientes para verificar conectividad
    await auditLogRepository.findRecent(1);
    return {
      status: 'ok',
      message: 'Audit service operational',
    };
  } catch (error: any) {
    return {
      status: 'error',
      message: `Audit service error: ${error.message}`,
    };
  }
}

/**
 * Verifica que el servicio de tokens est� funcionando correctamente
 */
export async function checkTokenServiceHealth(): Promise<{
  status: 'ok' | 'error';
  message: string;
  details?: any;
}> {
  try {
    // Verificar conectividad con repositorios
    const recentAuditLogs = await auditLogRepository.findRecent(1);
    const blacklistCount = await tokenBlacklistRepository.countActive();
    const refreshTokenCount = await refreshTokenRepository.countActive('test-user-id');

    return {
      status: 'ok',
      message: 'Token service operational',
      details: {
        blacklistAccessible: true,
        refreshTokenAccessible: true,
        activeBlacklistedTokens: blacklistCount,
        recentAuditLogs: recentAuditLogs.length,
        refreshTokenRecords: refreshTokenCount,
      },
    };
  } catch (error: any) {
    return {
      status: 'error',
      message: `Token service error: ${error.message}`,
    };
  }
}