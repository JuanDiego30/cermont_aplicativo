/**
 * Use Case: Generar reporte de costos
 * Resuelve: Comparativo de costos presupuestado vs real
 * 
 * @file backend/src/app/reports/use-cases/GenerateCostReport.ts
 */

import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository.js';
import { pdfGeneratorService } from '../../../infra/services/PdfGeneratorService.js';
import { costCalculatorService } from '../../../infra/services/CostCalculatorService.js';
import { logger } from '../../../shared/utils/logger.js';
import {
  ObjectIdValidator,
  ObjectIdValidationError,
} from '../../../shared/validators/ObjectIdValidator.js';

/**
 * DTO para generar reporte de costos
 */
export interface GenerateCostReportDto {
  workPlanId: string;
  realCost: number;
}

/**
 * Error de generaci�n
 */
export class GenerateCostReportError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'GenerateCostReportError';
  }
}

/**
 * Use Case: Generar Reporte de Costos
 * @class GenerateCostReport
 */
export class GenerateCostReport {
  constructor(private readonly workPlanRepository: IWorkPlanRepository) {}

  async execute(dto: GenerateCostReportDto): Promise<Buffer> {
    try {
      // Validar workPlanId
      const validatedId = ObjectIdValidator.validate(dto.workPlanId, 'ID del plan');

      logger.info('[GenerateCostReport] Generando reporte de costos', {
        workPlanId: validatedId,
      });

      // 1. Obtener plan de trabajo
      const workPlan = await this.workPlanRepository.findById(validatedId);

      if (!workPlan) {
        throw new GenerateCostReportError(
          `Plan de trabajo ${validatedId} no encontrado`,
          'WORKPLAN_NOT_FOUND',
          404
        );
      }

      // 2. Validar costo real
      if (dto.realCost < 0) {
        throw new GenerateCostReportError(
          'El costo real no puede ser negativo',
          'INVALID_COST',
          400
        );
      }

      // 3. Calcular variaci�n
      const variance = costCalculatorService.calculateVariance(
        workPlan.estimatedBudget,
        dto.realCost
      );

      logger.info('[GenerateCostReport] Variaci�n calculada', {
        budgeted: workPlan.estimatedBudget,
        real: dto.realCost,
        variance: variance.variance,
        percentage: variance.variancePercentage,
        status: variance.status,
      });

      // 4. Generar PDF
      const pdfBuffer = await pdfGeneratorService.generateCostComparisonReport(
        workPlan,
        dto.realCost
      );

      logger.info('[GenerateCostReport] Reporte generado', {
        workPlanId: validatedId,
        size: pdfBuffer.length,
      });

      return pdfBuffer;
    } catch (error) {
      if (error instanceof GenerateCostReportError || error instanceof ObjectIdValidationError) {
        throw error;
      }

      logger.error('[GenerateCostReport] Error inesperado', {
        error: error instanceof Error ? error.message : 'Unknown',
      });

      throw new GenerateCostReportError(
        'Error interno al generar reporte',
        'INTERNAL_ERROR',
        500
      );
    }
  }
}
