/**
 * Use Case: CheckExpiringCertifications
 * Busca certificaciones próximas a vencer y envía alertas
 * 
 * @file backend/src/app/equipment/use-cases/CheckExpiringCertifications.ts
 */

import type { ICertifiedEquipmentRepository } from '../../../domain/repositories/ICertifiedEquipmentRepository.js';
import type { CertifiedEquipment } from '../../../domain/entities/CertifiedEquipment.js';
import { getDaysUntilExpiry } from '../../../domain/entities/CertifiedEquipment.js';
import { logger } from '../../../shared/utils/logger.js';

const LOG_CONTEXT = '[CheckExpiringCertifications]';

export interface CertificationAlert {
  equipment: CertifiedEquipment;
  daysUntilExpiry: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
}

export interface INotificationService {
  sendUrgentAlert(params: {
    subject: string;
    recipients: string[];
    data: any;
  }): Promise<void>;

  sendWarning(params: {
    subject: string;
    recipients: string[];
    data: any;
  }): Promise<void>;

  sendInfo(params: {
    subject: string;
    recipients: string[];
    data: any;
  }): Promise<void>;
}

export class CheckExpiringCertificationsUseCase {
  constructor(
    private readonly equipmentRepository: ICertifiedEquipmentRepository,
    private readonly notificationService?: INotificationService
  ) {}

  async execute(daysAhead: number = 30): Promise<CertificationAlert[]> {
    const alerts: CertificationAlert[] = [];

    logger.info(`${LOG_CONTEXT} Iniciando verificación de certificaciones`, { daysAhead });

    // 1. Buscar equipos con certificación próxima a vencer
    const expiringEquipment = await this.equipmentRepository.findExpiringCertifications(daysAhead);

    // 2. Buscar equipos con certificación ya vencida
    const expiredEquipment = await this.equipmentRepository.findExpiredCertifications();

    // 3. Procesar equipos que expiran pronto
    for (const equipment of expiringEquipment) {
      const daysUntilExpiry = getDaysUntilExpiry(equipment.certification.expiryDate);
      const severity = this.determineSeverity(daysUntilExpiry);

      const alert: CertificationAlert = {
        equipment,
        daysUntilExpiry,
        severity,
        message: this.buildAlertMessage(equipment, daysUntilExpiry),
      };

      alerts.push(alert);

      // Enviar notificación según severidad
      if (this.notificationService) {
        await this.sendNotification(alert);
      }
    }

    // 4. Procesar equipos ya vencidos
    for (const equipment of expiredEquipment) {
      const daysUntilExpiry = getDaysUntilExpiry(equipment.certification.expiryDate);

      const alert: CertificationAlert = {
        equipment,
        daysUntilExpiry,
        severity: 'HIGH',
        message: `? VENCIDO: ${equipment.name} - Certificación vencida hace ${Math.abs(daysUntilExpiry)} días`,
      };

      alerts.push(alert);

      if (this.notificationService) {
        await this.sendNotification(alert);
      }
    }

    // 5. Log resumen
    logger.info(`${LOG_CONTEXT} Verificación completada`, {
      totalAlerts: alerts.length,
      high: alerts.filter(a => a.severity === 'HIGH').length,
      medium: alerts.filter(a => a.severity === 'MEDIUM').length,
      low: alerts.filter(a => a.severity === 'LOW').length,
      expired: expiredEquipment.length,
    });

    return alerts;
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private determineSeverity(daysUntilExpiry: number): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (daysUntilExpiry <= 0) return 'HIGH';  // Vencido
    if (daysUntilExpiry <= 7) return 'HIGH';  // Menos de 1 semana
    if (daysUntilExpiry <= 15) return 'MEDIUM'; // 1-2 semanas
    return 'LOW'; // Más de 2 semanas
  }

  private buildAlertMessage(equipment: CertifiedEquipment, daysUntilExpiry: number): string {
    const category = this.getCategoryLabel(equipment.category);
    const certType = equipment.certification.type;

    if (daysUntilExpiry <= 0) {
      return `? VENCIDO: ${category} "${equipment.name}" - ${certType} vencido hace ${Math.abs(daysUntilExpiry)} días`;
    }

    if (daysUntilExpiry <= 7) {
      return `?? URGENTE: ${category} "${equipment.name}" - ${certType} vence en ${daysUntilExpiry} día(s)`;
    }

    if (daysUntilExpiry <= 15) {
      return `?? AVISO: ${category} "${equipment.name}" - ${certType} vence en ${daysUntilExpiry} días`;
    }

    return `?? INFO: ${category} "${equipment.name}" - ${certType} vence en ${daysUntilExpiry} días`;
  }

  private getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      TOOL: 'Herramienta',
      EQUIPMENT: 'Equipo',
      PPE: 'EPP',
      VEHICLE: 'Vehículo',
      INSTRUMENT: 'Instrumento',
    };
    return labels[category] || category;
  }

  private async sendNotification(alert: CertificationAlert): Promise<void> {
    if (!this.notificationService) return;

    try {
      const recipients = this.getRecipients(alert.severity);

      if (alert.severity === 'HIGH') {
        await this.notificationService.sendUrgentAlert({
          subject: alert.message,
          recipients,
          data: {
            equipmentId: alert.equipment.id,
            equipmentName: alert.equipment.name,
            certificationType: alert.equipment.certification.type,
            certificationNumber: alert.equipment.certification.number,
            expiryDate: alert.equipment.certification.expiryDate,
            daysUntilExpiry: alert.daysUntilExpiry,
            documentUrl: alert.equipment.certification.documentUrl,
          },
        });
      } else if (alert.severity === 'MEDIUM') {
        await this.notificationService.sendWarning({
          subject: alert.message,
          recipients,
          data: {
            equipmentId: alert.equipment.id,
            equipmentName: alert.equipment.name,
            expiryDate: alert.equipment.certification.expiryDate,
            daysUntilExpiry: alert.daysUntilExpiry,
          },
        });
      } else {
        await this.notificationService.sendInfo({
          subject: alert.message,
          recipients,
          data: {
            equipmentId: alert.equipment.id,
            equipmentName: alert.equipment.name,
            expiryDate: alert.equipment.certification.expiryDate,
          },
        });
      }

      logger.info(`${LOG_CONTEXT} Notificación enviada`, {
        severity: alert.severity,
        equipmentId: alert.equipment.id,
        recipients: recipients.length,
      });
    } catch (error) {
      logger.error(`${LOG_CONTEXT} Error enviando notificación`, {
        error,
        equipmentId: alert.equipment.id,
      });
    }
  }

  private getRecipients(severity: 'HIGH' | 'MEDIUM' | 'LOW'): string[] {
    // TODO: Obtener de configuración o base de datos
    const recipients: string[] = [];

    if (severity === 'HIGH') {
      recipients.push('admin@cermont.com', 'supervisor@cermont.com', 'seguridad@cermont.com');
    } else if (severity === 'MEDIUM') {
      recipients.push('supervisor@cermont.com', 'operaciones@cermont.com');
    } else {
      recipients.push('operaciones@cermont.com');
    }

    return recipients;
  }
}
