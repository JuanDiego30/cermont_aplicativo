/**
 * Scheduled Job: CertificationExpiryAlertJob
 * Ejecuta verificación diaria de certificaciones próximas a vencer
 * 
 * @file backend/src/jobs/CertificationExpiryAlertJob.ts
 */

import cron from 'node-cron';
import { CheckExpiringCertificationsUseCase, type INotificationService } from '../app/equipment/use-cases/CheckExpiringCertifications.js';
import { CertifiedEquipmentRepository } from '../infra/db/repositories/CertifiedEquipmentRepository.js';
import { logger } from '../shared/utils/logger.js';

const LOG_CONTEXT = '[CertificationExpiryAlertJob]';

// Implementación simple del servicio de notificaciones
// TODO: Reemplazar con implementación real (Email, SMS, etc.)
class SimpleNotificationService implements INotificationService {
  async sendUrgentAlert(params: { subject: string; recipients: string[]; data: any }): Promise<void> {
    logger.warn(`?? ALERTA URGENTE: ${params.subject}`, {
      recipients: params.recipients,
      data: params.data,
    });
    // TODO: Enviar email real aquí
  }

  async sendWarning(params: { subject: string; recipients: string[]; data: any }): Promise<void> {
    logger.warn(`?? ADVERTENCIA: ${params.subject}`, {
      recipients: params.recipients,
      data: params.data,
    });
    // TODO: Enviar email real aquí
  }

  async sendInfo(params: { subject: string; recipients: string[]; data: any }): Promise<void> {
    logger.info(`?? INFORMACIÓN: ${params.subject}`, {
      recipients: params.recipients,
      data: params.data,
    });
    // TODO: Enviar email real aquí
  }
}

export class CertificationExpiryAlertJob {
  private checkExpiringCertifications: CheckExpiringCertificationsUseCase;
  private isRunning: boolean = false;

  constructor() {
    const equipmentRepository = new CertifiedEquipmentRepository();
    const notificationService = new SimpleNotificationService();
    
    this.checkExpiringCertifications = new CheckExpiringCertificationsUseCase(
      equipmentRepository,
      notificationService
    );
  }

  /**
   * Inicia el job programado
   * Se ejecuta todos los días a las 6:00 AM
   */
  start(): void {
    // Ejecutar todos los días a las 6:00 AM (hora del servidor)
    cron.schedule('0 6 * * *', async () => {
      await this.execute();
    });

    logger.info(`${LOG_CONTEXT} Job programado: Todos los días a las 6:00 AM`);
  }

  /**
   * Ejecuta la verificación manualmente
   */
  async execute(): Promise<void> {
    if (this.isRunning) {
      logger.warn(`${LOG_CONTEXT} Job ya en ejecución, omitiendo...`);
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    logger.info(`${LOG_CONTEXT} Iniciando verificación de certificaciones`);

    try {
      // Buscar certificaciones que expiran en los próximos 30 días
      const alerts = await this.checkExpiringCertifications.execute(30);

      const duration = Date.now() - startTime;

      logger.info(`${LOG_CONTEXT} Verificación completada`, {
        duration: `${duration}ms`,
        totalAlerts: alerts.length,
        high: alerts.filter(a => a.severity === 'HIGH').length,
        medium: alerts.filter(a => a.severity === 'MEDIUM').length,
        low: alerts.filter(a => a.severity === 'LOW').length,
      });

      // Log detallado de alertas críticas
      const criticalAlerts = alerts.filter(a => a.severity === 'HIGH');
      if (criticalAlerts.length > 0) {
        logger.warn(`${LOG_CONTEXT} ${criticalAlerts.length} alertas críticas detectadas`, {
          equipos: criticalAlerts.map(a => ({
            nombre: a.equipment.name,
            categoria: a.equipment.category,
            diasHastaVencimiento: a.daysUntilExpiry,
            certificacion: a.equipment.certification.type,
          })),
        });
      }

    } catch (error) {
      logger.error(`${LOG_CONTEXT} Error en verificación`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Detiene el job (para testing o shutdown graceful)
   */
  stop(): void {
    logger.info(`${LOG_CONTEXT} Job detenido`);
  }
}

// Singleton instance
let jobInstance: CertificationExpiryAlertJob | null = null;

export function getCertificationExpiryAlertJob(): CertificationExpiryAlertJob {
  if (!jobInstance) {
    jobInstance = new CertificationExpiryAlertJob();
  }
  return jobInstance;
}

export function startCertificationExpiryAlertJob(): void {
  const job = getCertificationExpiryAlertJob();
  job.start();
  logger.info(`${LOG_CONTEXT} Job iniciado correctamente`);
}
