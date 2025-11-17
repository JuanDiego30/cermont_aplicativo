/**
 * Use Case: Generar informe de actividad
 * Resuelve: Generación automática de informe técnico
 * 
 * @file backend/src/app/reports/use-cases/GenerateActivityReport.ts
 */

import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository';
import type { IEvidenceRepository } from '../../../domain/repositories/IEvidenceRepository';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { pdfGeneratorService, type ActivityReportData } from '../../../infra/services/PdfGeneratorService';
import { logger } from '../../../shared/utils/logger';
import {
  ObjectIdValidator,
  ObjectIdValidationError,
} from '../../../shared/validators/ObjectIdValidator';

/**
 * DTO para generar reporte
 */
export interface GenerateActivityReportDto {
  orderId: string;
  observations?: string;
}

/**
 * Error de generación
 */
export class GenerateActivityReportError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'GenerateActivityReportError';
  }
}

/**
 * Use Case: Generar Informe de Actividad
 * @class GenerateActivityReport
 */
export class GenerateActivityReport {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly workPlanRepository: IWorkPlanRepository,
    private readonly evidenceRepository: IEvidenceRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(dto: GenerateActivityReportDto): Promise<Buffer> {
    try {
      // Validar orderId
      const validatedOrderId = ObjectIdValidator.validate(dto.orderId, 'ID de la orden');

      logger.info('[GenerateActivityReport] Generando informe', { orderId: validatedOrderId });

      // 1. Obtener orden
      const order = await this.orderRepository.findById(validatedOrderId);

      if (!order) {
        throw new GenerateActivityReportError(
          `Orden ${validatedOrderId} no encontrada`,
          'ORDER_NOT_FOUND',
          404
        );
      }

      // 2. Obtener plan de trabajo
      const workPlan = await this.workPlanRepository.findByOrderId(validatedOrderId);

      if (!workPlan) {
        throw new GenerateActivityReportError(
          'No se encontró plan de trabajo asociado',
          'WORKPLAN_NOT_FOUND',
          404
        );
      }

      // 3. Obtener evidencias
      const evidences = await this.evidenceRepository.findByOrderId(validatedOrderId);

      // 4. Obtener técnico responsable
      let technician = { name: 'N/A', role: 'N/A' };
      
      if (order.responsibleId) {
        const user = await this.userRepository.findById(order.responsibleId);
        if (user) {
          technician = { name: user.name, role: user.role };
        }
      }

      // 5. Preparar datos del reporte
      const reportData: ActivityReportData = {
        order,
        workPlan,
        evidences,
        technician,
        client: {
          name: order.clientName,
          representative: order.contact?.name || 'N/A',
        },
        executionDetails: {
          startDate: workPlan.actualStart || workPlan.plannedStart || new Date(),
          endDate: workPlan.actualEnd || workPlan.plannedEnd || new Date(),
          durationHours: order.actualHours || order.estimatedHours || 0,
          location: order.location,
        },
        observations: dto.observations,
        generatedAt: new Date(),
      };

      // 6. Generar PDF
      const pdfBuffer = await pdfGeneratorService.generateActivityReport(reportData);

      logger.info('[GenerateActivityReport] Informe generado', {
        orderId: validatedOrderId,
        size: pdfBuffer.length,
      });

      return pdfBuffer;
    } catch (error) {
      if (error instanceof GenerateActivityReportError || error instanceof ObjectIdValidationError) {
        throw error;
      }

      logger.error('[GenerateActivityReport] Error inesperado', {
        error: error instanceof Error ? error.message : 'Unknown',
      });

      throw new GenerateActivityReportError(
        'Error interno al generar informe',
        'INTERNAL_ERROR',
        500
      );
    }
  }
}
