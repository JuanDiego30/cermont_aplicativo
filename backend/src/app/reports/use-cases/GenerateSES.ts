/**
 * Use Case: Generar formato SES
 * 
 * Genera un documento PDF formal de Seguridad, Salud y Medio Ambiente (SES)
 * para una orden de trabajo.
 * 
 * Incluye:
 * - Checklist de seguridad verificado
 * - Certificaciones de equipos y herramientas
 * - Análisis de trabajo seguro (ATS)
 * - Certificaciones del técnico
 * 
 * Requisitos:
 * - La orden debe existir y estar en estado SES o posterior
 * - Debe tener un plan de trabajo asociado
 * - Debe proporcionar al menos un item de checklist
 * 
 * El PDF generado se almacena automáticamente y se registra en auditoría.
 * 
 * @file backend/src/app/reports/use-cases/GenerateSES.ts
 */

import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository.js';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import type { IFileStorageService } from '../../../domain/services/IFileStorageService.js';
import type { IPdfGeneratorService, SESData } from '../../../domain/services/IPdfGeneratorService.js';
import type { Order } from '../../../domain/entities/Order.js';
import type { WorkPlan } from '../../../domain/entities/WorkPlan.js';
import type { User } from '../../../domain/entities/User.js';
import { OrderState } from '../../../domain/entities/Order.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';

const VALID_STATES_FOR_SES = new Set<OrderState>([
  OrderState.SES,
  OrderState.FACTURA,
  OrderState.PAGO,
]);

const VALIDATION_LIMITS = {
  MIN_CHECKLIST_ITEMS: 1,
  MAX_CHECKLIST_ITEMS: 50,
  MAX_ITEM_LENGTH: 200,
  MAX_OBSERVATIONS_LENGTH: 500,
  MAX_CERT_NAME_LENGTH: 100,
  MAX_CERT_NUMBER_LENGTH: 50,
} as const;

const ERROR_MESSAGES = {
  MISSING_ORDER_ID: 'El ID de la orden es requerido',
  MISSING_CHECKLIST: 'Debe proporcionar al menos un item del checklist de seguridad',
  CHECKLIST_TOO_MANY: `El checklist no puede tener más de ${VALIDATION_LIMITS.MAX_CHECKLIST_ITEMS} items`,
  ITEM_TOO_LONG: `Cada item del checklist no puede exceder ${VALIDATION_LIMITS.MAX_ITEM_LENGTH} caracteres`,
  OBSERVATIONS_TOO_LONG: `Las observaciones no pueden exceder ${VALIDATION_LIMITS.MAX_OBSERVATIONS_LENGTH} caracteres`,
  CERT_NAME_TOO_LONG: `El nombre de la certificación no puede exceder ${VALIDATION_LIMITS.MAX_CERT_NAME_LENGTH} caracteres`,
  CERT_NUMBER_TOO_LONG: `El número de certificación no puede exceder ${VALIDATION_LIMITS.MAX_CERT_NUMBER_LENGTH} caracteres`,
  INVALID_EXPIRY_DATE: 'La fecha de vencimiento debe ser válida y futura',
  ORDER_NOT_FOUND: (id: string) => `Orden ${id} no encontrada`,
  WORKPLAN_NOT_FOUND: 'No se encontró plan de trabajo asociado a la orden',
  INVALID_STATE: (current: OrderState) =>
    `No se puede generar SES para orden en estado ${current}. Estados válidos: ${Array.from(VALID_STATES_FOR_SES).join(', ')}`,
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[GenerateSESUseCase]',
} as const;

interface SafetyChecklistItem {
  item: string;
  verified: boolean;
  observations?: string;
}

interface EquipmentCertification {
  name: string;
  certNumber: string;
  expiryDate: Date;
}

interface GenerateSESInput {
  orderId: string;
  safetyChecklist: SafetyChecklistItem[];
  equipmentCertifications?: EquipmentCertification[];
  generatedBy: string;
  ip?: string;
  userAgent?: string;
}

interface GenerateSESOutput {
  pdfBuffer: Buffer;
  filePath: string;
  fileSize: number;
  generatedAt: Date;
}

interface AuditContext {
  ip: string;
  userAgent: string;
}

export class GenerateSESUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly workPlanRepository: IWorkPlanRepository,
    private readonly userRepository: IUserRepository,
    private readonly pdfGeneratorService: IPdfGeneratorService,
    private readonly fileStorageService: IFileStorageService,
    private readonly auditService: AuditService
  ) {}

  async execute(input: GenerateSESInput): Promise<GenerateSESOutput> {
    this.validateInput(input);

    const order = await this.fetchOrder(input.orderId);
    this.validateOrderState(order);

    const workPlan = await this.fetchWorkPlan(input.orderId);
    const technician = await this.fetchTechnician(order.responsibleId);

    const sesData = this.buildSESData(order, workPlan, technician, input);
    const pdfBuffer = await this.generatePdf(sesData);

    const filePath = await this.storePdf(order, pdfBuffer);

    const auditContext = this.extractAuditContext(input);
    await this.logSESGeneration(order, input.generatedBy, filePath, auditContext);

    logger.info(`${LOG_CONTEXT.USE_CASE} Formato SES generado exitosamente`, {
      orderId: order.id,
      orderNumber: order.orderNumber,
      filePath,
      fileSize: pdfBuffer.length,
      checklistItems: input.safetyChecklist.length,
      certifications: input.equipmentCertifications?.length || 0,
      generatedBy: input.generatedBy,
    });

    return {
      pdfBuffer,
      filePath,
      fileSize: pdfBuffer.length,
      generatedAt: new Date(),
    };
  }

  private validateInput(input: GenerateSESInput): void {
    if (!input.orderId?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_ORDER_ID);
    }

    this.validateSafetyChecklist(input.safetyChecklist);

    if (input.equipmentCertifications) {
      this.validateEquipmentCertifications(input.equipmentCertifications);
    }
  }

  private validateSafetyChecklist(checklist: SafetyChecklistItem[]): void {
    if (!Array.isArray(checklist) || checklist.length < VALIDATION_LIMITS.MIN_CHECKLIST_ITEMS) {
      throw new Error(ERROR_MESSAGES.MISSING_CHECKLIST);
    }

    if (checklist.length > VALIDATION_LIMITS.MAX_CHECKLIST_ITEMS) {
      throw new Error(ERROR_MESSAGES.CHECKLIST_TOO_MANY);
    }

    for (const item of checklist) {
      if (!item.item || item.item.trim().length === 0) {
        throw new Error('Cada item del checklist debe tener descripción');
      }

      if (item.item.length > VALIDATION_LIMITS.MAX_ITEM_LENGTH) {
        throw new Error(ERROR_MESSAGES.ITEM_TOO_LONG);
      }

      if (item.observations && item.observations.length > VALIDATION_LIMITS.MAX_OBSERVATIONS_LENGTH) {
        throw new Error(ERROR_MESSAGES.OBSERVATIONS_TOO_LONG);
      }

      if (typeof item.verified !== 'boolean') {
        throw new Error('Cada item debe tener el campo "verified" como booleano');
      }
    }
  }

  private validateEquipmentCertifications(certifications: EquipmentCertification[]): void {
    for (const cert of certifications) {
      if (!cert.name || cert.name.trim().length === 0) {
        throw new Error('Cada certificación debe tener nombre');
      }

      if (cert.name.length > VALIDATION_LIMITS.MAX_CERT_NAME_LENGTH) {
        throw new Error(ERROR_MESSAGES.CERT_NAME_TOO_LONG);
      }

      if (!cert.certNumber || cert.certNumber.trim().length === 0) {
        throw new Error('Cada certificación debe tener número');
      }

      if (cert.certNumber.length > VALIDATION_LIMITS.MAX_CERT_NUMBER_LENGTH) {
        throw new Error(ERROR_MESSAGES.CERT_NUMBER_TOO_LONG);
      }

      const expiryDate = new Date(cert.expiryDate);
      if (Number.isNaN(expiryDate.getTime()) || expiryDate < new Date()) {
        throw new Error(ERROR_MESSAGES.INVALID_EXPIRY_DATE);
      }
    }
  }

  private async fetchOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Orden no encontrada`, { orderId });
      throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND(orderId));
    }

    return order;
  }

  private validateOrderState(order: Order): void {
    if (!VALID_STATES_FOR_SES.has(order.state)) {
      throw new Error(ERROR_MESSAGES.INVALID_STATE(order.state));
    }
  }

  private async fetchWorkPlan(orderId: string): Promise<WorkPlan> {
    const workPlan = await this.workPlanRepository.findByOrderId(orderId);

    if (!workPlan) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Plan de trabajo no encontrado`, { orderId });
      throw new Error(ERROR_MESSAGES.WORKPLAN_NOT_FOUND);
    }

    return workPlan;
  }

  private async fetchTechnician(responsibleId: string | null): Promise<User | null> {
    if (!responsibleId) {
      return null;
    }

    try {
      return await this.userRepository.findById(responsibleId);
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error obteniendo técnico (no crítico)`, {
        responsibleId,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      return null;
    }
  }

  private buildSESData(
    order: Order,
    workPlan: WorkPlan,
    technician: User | null,
    input: GenerateSESInput
  ): SESData {
    const defaultDate = new Date();
    return {
      orderNumber: order.orderNumber,
      clientName: order.clientName,
      location: order.location ?? 'Sin ubicación',
      description: order.description,
      date: new Date(),
      workPlan: {
        plannedStart: workPlan.plannedWindow?.start ?? defaultDate,
        plannedEnd: workPlan.plannedWindow?.end ?? defaultDate,
        tasks: (workPlan.tasks || []).map(t => ({
          description: t.description,
          completed: t.completed,
        })),
      },
      technician: technician
        ? {
            name: technician.name,
            role: technician.role,
            certifications: technician.professionalDetails?.certifications || [],
          }
        : {
            name: 'No asignado',
            role: 'N/A',
            certifications: [],
          },
      safetyChecklist: input.safetyChecklist.map((item) => ({
        item: item.item.trim(),
        verified: item.verified,
        observations: item.observations?.trim(),
      })),
      equipmentCertifications: (input.equipmentCertifications || []).map((cert) => ({
        name: cert.name.trim(),
        certNumber: cert.certNumber.trim(),
        expiryDate: cert.expiryDate,
      })),
      riskAnalysis: (workPlan.riskAnalysis || []).map(r => ({
        hazard: r.hazard,
        risk: r.risk,
        controls: r.controls,
      })),
    };
  }

  private async generatePdf(sesData: SESData): Promise<Buffer> {
    try {
      return await this.pdfGeneratorService.generateSES(sesData);
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error generando PDF`, {
        orderNumber: sesData.orderNumber,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }

  private async storePdf(order: Order, pdfBuffer: Buffer): Promise<string> {
    try {
      const fileName = `formato-ses-${order.orderNumber}-${Date.now()}.pdf`;
      const filePath = await this.fileStorageService.upload(fileName, pdfBuffer, 'application/pdf');

      return filePath;
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error almacenando PDF`, {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }

  private extractAuditContext(input: GenerateSESInput): AuditContext {
    return {
      ip: input.ip || 'unknown',
      userAgent: input.userAgent || 'unknown',
    };
  }

  private async logSESGeneration(
    order: Order,
    generatedBy: string,
    filePath: string,
    auditContext: AuditContext
  ): Promise<void> {
    try {
      await this.auditService.log({
        entityType: 'Order',
        entityId: order.id,
        action: AuditAction.GENERATE_SES,
        userId: generatedBy,
        before: null,
        after: {
          sesGenerated: true,
          sesFilePath: filePath,
          generatedAt: new Date(),
        },
        ip: auditContext.ip,
        userAgent: auditContext.userAgent,
        reason: 'Formato SES generado',
      });
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error registrando auditoría (no crítico)`, {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }
}

