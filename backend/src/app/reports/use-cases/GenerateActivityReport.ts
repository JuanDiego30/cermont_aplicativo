/**
 * Use Case: Generar informe de actividad
 * 
 * Genera un documento PDF técnico con el reporte de actividades realizadas
 * en una orden de trabajo.
 * 
 * Incluye:
 * - Datos de la orden y cliente
 * - Plan de trabajo ejecutado
 * - Evidencias fotográficas/documentales
 * - Duración real del trabajo
 * - Observaciones técnicas
 * 
 * Requisitos:
 * - La orden debe existir y estar en estado INFORME o posterior
 * - Debe tener un plan de trabajo asociado
 * 
 * El PDF generado se almacena automáticamente y se registra en auditoría.
 * 
 * @file backend/src/app/reports/use-cases/GenerateActivityReport.ts
 */

import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository.js';
import type { IEvidenceRepository } from '../../../domain/repositories/IEvidenceRepository.js';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import type { IFileStorageService } from '../../../domain/services/IFileStorageService.js';
import type { IPdfGeneratorService, ActivityReportData } from '../../../domain/services/IPdfGeneratorService.js';
import type { Order } from '../../../domain/entities/Order.js';
import type { WorkPlan } from '../../../domain/entities/WorkPlan.js';
import type { Evidence } from '../../../domain/entities/Evidence.js';
import type { User } from '../../../domain/entities/User.js';
import { OrderState } from '../../../domain/entities/Order.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';

const VALID_STATES_FOR_REPORT = new Set<OrderState>([
  OrderState.INFORME,
  OrderState.ACTA,
  OrderState.SES,
  OrderState.FACTURA,
  OrderState.PAGO,
]);

const VALIDATION_LIMITS = {
  OBSERVATIONS: { max: 2000 },
} as const;

const ERROR_MESSAGES = {
  MISSING_ORDER_ID: 'El ID de la orden es requerido',
  ORDER_NOT_FOUND: (id: string) => `Orden ${id} no encontrada`,
  WORKPLAN_NOT_FOUND: 'No se encontró plan de trabajo asociado a la orden',
  INVALID_STATE: (current: OrderState) =>
    `No se puede generar informe para orden en estado ${current}. Estados válidos: ${Array.from(VALID_STATES_FOR_REPORT).join(', ')}`,
  OBSERVATIONS_TOO_LONG: `Las observaciones no pueden exceder ${VALIDATION_LIMITS.OBSERVATIONS.max} caracteres`,
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[GenerateActivityReportUseCase]',
} as const;

interface GenerateActivityReportInput {
  orderId: string;
  observations?: string;
  generatedBy: string;
  ip?: string;
  userAgent?: string;
}

interface GenerateActivityReportOutput {
  pdfBuffer: Buffer;
  filePath: string;
  fileSize: number;
  generatedAt: Date;
}

interface AuditContext {
  ip: string;
  userAgent: string;
}

export class GenerateActivityReportUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly workPlanRepository: IWorkPlanRepository,
    private readonly evidenceRepository: IEvidenceRepository,
    private readonly userRepository: IUserRepository,
    private readonly pdfGeneratorService: IPdfGeneratorService,
    private readonly fileStorageService: IFileStorageService,
    private readonly auditService: AuditService
  ) {}

  async execute(input: GenerateActivityReportInput): Promise<GenerateActivityReportOutput> {
    this.validateInput(input);

    const order = await this.fetchOrder(input.orderId);
    this.validateOrderState(order);

    const workPlan = await this.fetchWorkPlan(input.orderId);
    const evidences = await this.fetchEvidences(input.orderId);
    const technician = await this.fetchTechnician(order.responsibleId);

    const reportData = this.buildReportData(order, workPlan, evidences, technician, input);
    const pdfBuffer = await this.generatePdf(reportData);

    const filePath = await this.storePdf(order, pdfBuffer);

    const auditContext = this.extractAuditContext(input);
    await this.logReportGeneration(order, input.generatedBy, filePath, auditContext);

    logger.info(`${LOG_CONTEXT.USE_CASE} Informe de actividad generado exitosamente`, {
      orderId: order.id,
      orderNumber: order.orderNumber,
      filePath,
      fileSize: pdfBuffer.length,
      evidencesIncluded: evidences.length,
      generatedBy: input.generatedBy,
    });

    return {
      pdfBuffer,
      filePath,
      fileSize: pdfBuffer.length,
      generatedAt: new Date(),
    };
  }

  private validateInput(input: GenerateActivityReportInput): void {
    if (!input.orderId?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_ORDER_ID);
    }

    if (input.observations) {
      this.validateObservations(input.observations);
    }
  }

  private validateObservations(observations: string): void {
    if (observations.length > VALIDATION_LIMITS.OBSERVATIONS.max) {
      throw new Error(ERROR_MESSAGES.OBSERVATIONS_TOO_LONG);
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
    if (!VALID_STATES_FOR_REPORT.has(order.state)) {
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

  private async fetchEvidences(orderId: string): Promise<Evidence[]> {
    try {
      return await this.evidenceRepository.findByOrderId(orderId);
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error obteniendo evidencias (continuando sin evidencias)`, {
        orderId,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      return [];
    }
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

  private buildReportData(
    order: Order,
    workPlan: WorkPlan,
    evidences: Evidence[],
    technician: User | null,
    input: GenerateActivityReportInput
  ): ActivityReportData {
    const durationHours = this.calculateDurationHours(workPlan);
    const defaultDate = new Date();

    const startDate = workPlan.actualWindow?.start || workPlan.plannedWindow?.start || defaultDate;
    const endDate = workPlan.actualWindow?.end || workPlan.plannedWindow?.end || defaultDate;

    return {
      order: {
        orderNumber: order.orderNumber,
        clientName: order.clientName,
        location: order.location ?? 'Sin ubicación',
        description: order.description,
        createdAt: order.createdAt,
      },
      execution: {
        startDate,
        endDate,
        durationHours,
      },
      evidences: evidences.map((evidence) => ({
        description: evidence.description ?? '',
        type: evidence.type,
        filePath: evidence.filePath,
        capturedAt: evidence.capturedAt ?? evidence.createdAt,
      })),
      technician: technician
        ? {
            name: technician.name,
            role: technician.role,
            email: technician.email,
          }
        : {
            name: 'No asignado',
            role: 'N/A',
            email: 'N/A',
          },
      observations: input.observations?.trim(),
      generatedAt: new Date(),
    };
  }

  private calculateDurationHours(workPlan: WorkPlan): number {
    const startDate = workPlan.actualWindow?.start || workPlan.plannedWindow?.start;
    const endDate = workPlan.actualWindow?.end || workPlan.plannedWindow?.end;

    if (!startDate || !endDate) {
      return 0;
    }

    const diffMs = endDate.getTime() - startDate.getTime();
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

    return Math.max(diffHours, 0); // Nunca negativo
  }

  private async generatePdf(reportData: ActivityReportData): Promise<Buffer> {
    try {
      return await this.pdfGeneratorService.generateActivityReport(reportData);
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error generando PDF`, {
        orderNumber: reportData.order.orderNumber,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }

  private async storePdf(order: Order, pdfBuffer: Buffer): Promise<string> {
    try {
      const fileName = `informe-actividad-${order.orderNumber}-${Date.now()}.pdf`;
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

  private extractAuditContext(input: GenerateActivityReportInput): AuditContext {
    return {
      ip: input.ip || 'unknown',
      userAgent: input.userAgent || 'unknown',
    };
  }

  private async logReportGeneration(
    order: Order,
    generatedBy: string,
    filePath: string,
    auditContext: AuditContext
  ): Promise<void> {
    try {
      await this.auditService.log({
        entityType: 'Order',
        entityId: order.id,
        action: AuditAction.GENERATE_INFORME,
        userId: generatedBy,
        before: null,
        after: {
          reportGenerated: true,
          reportFilePath: filePath,
          generatedAt: new Date(),
        },
        ip: auditContext.ip,
        userAgent: auditContext.userAgent,
        reason: 'Informe de actividad generado',
      });
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error registrando auditoría (no crítico)`, {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }
}

