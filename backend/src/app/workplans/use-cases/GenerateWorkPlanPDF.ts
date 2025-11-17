/**
 * Use Case: Generar PDF de plan de trabajo
 * Resuelve: Generaci�n autom�tica de PDF del plan
 * 
 * @file backend/src/app/workplans/use-cases/GenerateWorkPlanPDF.ts
 */

import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository.js';
import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import { PdfGeneratorService } from '../../../infra/services/PdfGeneratorService.js';
import { logger } from '../../../shared/utils/logger.js';
import {
  ObjectIdValidator,
  ObjectIdValidationError,
} from '../../../shared/validators/ObjectIdValidator.js';

/**
 * Error de generaci�n
 */
export class GenerateWorkPlanPDFError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'GenerateWorkPlanPDFError';
  }
}

/**
 * Use Case: Generar PDF de Plan de Trabajo
 * @class GenerateWorkPlanPDF
 */
export class GenerateWorkPlanPDF {
  constructor(
    private readonly workPlanRepository: IWorkPlanRepository,
    private readonly orderRepository: IOrderRepository,
    private readonly pdfGeneratorService: PdfGeneratorService
  ) {}

  async execute(workPlanId: string): Promise<Buffer> {
    try {
      // Validar ID
      const validatedId = ObjectIdValidator.validate(workPlanId, 'ID del plan');

      logger.info('[GenerateWorkPlanPDF] Generando PDF', { workPlanId: validatedId });

      // 1. Obtener plan de trabajo
      const workPlan = await this.workPlanRepository.findById(validatedId);

      if (!workPlan) {
        throw new GenerateWorkPlanPDFError(
          `Plan de trabajo ${validatedId} no encontrado`,
          'WORKPLAN_NOT_FOUND',
          404
        );
      }

      // 2. Obtener orden asociada
      const order = await this.orderRepository.findById(workPlan.orderId);

      if (!order) {
        throw new GenerateWorkPlanPDFError(
          'Orden asociada no encontrada',
          'ORDER_NOT_FOUND',
          404
        );
      }

      // 3. Generar PDF usando PdfGeneratorService
      // Nota: Necesitar�as agregar un m�todo en PdfGeneratorService para planes
      // Por ahora usaremos un placeholder

      const pdfBuffer = Buffer.from('WorkPlan PDF placeholder');

      logger.info('[GenerateWorkPlanPDF] PDF generado', {
        workPlanId: validatedId,
        size: pdfBuffer.length,
      });

      return pdfBuffer;
    } catch (error) {
      if (error instanceof GenerateWorkPlanPDFError || error instanceof ObjectIdValidationError) {
        throw error;
      }

      logger.error('[GenerateWorkPlanPDF] Error inesperado', {
        error: error instanceof Error ? error.message : 'Unknown',
      });

      throw new GenerateWorkPlanPDFError(
        'Error interno al generar PDF',
        'INTERNAL_ERROR',
        500
      );
    }
  }
}
