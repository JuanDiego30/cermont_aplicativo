/**
 * Use Case: CreateCertifiedEquipment
 * Crea un nuevo equipo certificado con validaciones
 * 
 * @file backend/src/app/equipment/use-cases/CreateCertifiedEquipment.ts
 */

import type { ICertifiedEquipmentRepository } from '../../../domain/repositories/ICertifiedEquipmentRepository.js';
import type { CertifiedEquipment, Certification, MaintenanceSchedule } from '../../../domain/entities/CertifiedEquipment.js';
import { 
  determineEquipmentStatus, 
  isCertificationExpired,
  EquipmentCategory,
  EquipmentStatus
} from '../../../domain/entities/CertifiedEquipment.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';

const LOG_CONTEXT = '[CreateCertifiedEquipment]';

const ERROR_MESSAGES = {
  INVALID_NAME: 'El nombre del equipo es requerido',
  INVALID_CATEGORY: 'La categoría es inválida',
  INVALID_CERTIFICATION: 'Los datos de certificación son inválidos',
  EXPIRY_IN_PAST: 'La fecha de vencimiento no puede estar en el pasado',
  DUPLICATE_SERIAL: 'Ya existe un equipo con ese número de serie',
  INVALID_DATES: 'La fecha de emisión debe ser anterior a la fecha de vencimiento',
  MISSING_ISSUED_BY: 'Debe especificar la entidad certificadora',
} as const;

export interface CreateEquipmentInput {
  name: string;
  description?: string;
  category: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  
  certification: {
    type: string;
    number: string;
    issueDate: string;
    expiryDate: string;
    issuedBy: string;
    documentUrl?: string;
    notes?: string;
  };
  
  maintenanceSchedule?: {
    lastMaintenance: string;
    frequencyInDays: number;
    maintenanceType: string;
    notes?: string;
  };
  
  location?: string;
  createdBy: string;
}

export class CreateCertifiedEquipmentUseCase {
  constructor(
    private readonly equipmentRepository: ICertifiedEquipmentRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(input: CreateEquipmentInput): Promise<CertifiedEquipment> {
    // 1. Validaciones
    await this.validate(input);

    // 2. Parsear certificación
    const certification: Certification = {
      type: input.certification.type,
      number: input.certification.number,
      issueDate: new Date(input.certification.issueDate),
      expiryDate: new Date(input.certification.expiryDate),
      issuedBy: input.certification.issuedBy,
      documentUrl: input.certification.documentUrl,
      notes: input.certification.notes,
    };

    // 3. Calcular próximo mantenimiento si aplica
    let maintenanceSchedule: MaintenanceSchedule | undefined;
    if (input.maintenanceSchedule) {
      const lastMaintenance = new Date(input.maintenanceSchedule.lastMaintenance);
      const nextMaintenance = this.calculateNextMaintenance(
        lastMaintenance,
        input.maintenanceSchedule.frequencyInDays
      );

      maintenanceSchedule = {
        lastMaintenance,
        nextMaintenance,
        frequencyInDays: input.maintenanceSchedule.frequencyInDays,
        maintenanceType: input.maintenanceSchedule.maintenanceType,
        notes: input.maintenanceSchedule.notes,
      };
    }

    // 4. Determinar estado inicial
    const status = this.determineInitialStatus(certification.expiryDate);

    // 5. Crear equipo
    const equipment = await this.equipmentRepository.create({
      name: input.name,
      description: input.description,
      category: input.category as EquipmentCategory,
      manufacturer: input.manufacturer,
      model: input.model,
      serialNumber: input.serialNumber,
      certification,
      maintenanceSchedule,
      status,
      location: input.location,
      createdBy: input.createdBy,
    });

    // 6. Registrar auditoría
    await this.logAudit(equipment, input.createdBy);

    logger.info(`${LOG_CONTEXT} Equipo certificado creado`, {
      equipmentId: equipment.id,
      name: equipment.name,
      category: equipment.category,
      status: equipment.status,
      expiryDate: equipment.certification.expiryDate,
    });

    return equipment;
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private async validate(input: CreateEquipmentInput): Promise<void> {
    // Nombre
    if (!input.name?.trim()) {
      throw new Error(ERROR_MESSAGES.INVALID_NAME);
    }

    // Categoría
    const validCategories = Object.values(EquipmentCategory);
    if (!input.category || !validCategories.includes(input.category as EquipmentCategory)) {
      throw new Error(ERROR_MESSAGES.INVALID_CATEGORY);
    }

    // Certificación
    if (!input.certification?.type || !input.certification?.number || !input.certification?.expiryDate) {
      throw new Error(ERROR_MESSAGES.INVALID_CERTIFICATION);
    }

    if (!input.certification.issuedBy?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_ISSUED_BY);
    }

    // Fechas
    const issueDate = new Date(input.certification.issueDate);
    const expiryDate = new Date(input.certification.expiryDate);

    if (issueDate >= expiryDate) {
      throw new Error(ERROR_MESSAGES.INVALID_DATES);
    }

    if (expiryDate < new Date()) {
      throw new Error(ERROR_MESSAGES.EXPIRY_IN_PAST);
    }

    // Serial number único
    if (input.serialNumber) {
      const exists = await this.equipmentRepository.existsBySerialNumber(input.serialNumber);
      if (exists) {
        throw new Error(ERROR_MESSAGES.DUPLICATE_SERIAL);
      }
    }

    // Mantenimiento
    if (input.maintenanceSchedule) {
      if (input.maintenanceSchedule.frequencyInDays < 1) {
        throw new Error('La frecuencia de mantenimiento debe ser mayor a 0 días');
      }
    }
  }

  private calculateNextMaintenance(lastMaintenance: Date, frequencyInDays: number): Date {
    const next = new Date(lastMaintenance);
    next.setDate(next.getDate() + frequencyInDays);
    return next;
  }

  private determineInitialStatus(expiryDate: Date): EquipmentStatus {
    return isCertificationExpired(expiryDate) 
      ? EquipmentStatus.EXPIRED 
      : EquipmentStatus.AVAILABLE;
  }

  private async logAudit(equipment: CertifiedEquipment, userId: string): Promise<void> {
    try {
      await this.auditService.log({
        entityType: 'CertifiedEquipment',
        entityId: equipment.id,
        action: AuditAction.CREATE,
        userId,
        before: null,
        after: {
          name: equipment.name,
          category: equipment.category,
          status: equipment.status,
          certification: {
            type: equipment.certification.type,
            expiryDate: equipment.certification.expiryDate,
          },
        },
        reason: 'Nuevo equipo certificado registrado',
      });
    } catch (error) {
      logger.warn(`${LOG_CONTEXT} Error en auditoría (no crítico)`, { error });
    }
  }
}
