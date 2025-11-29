/**
 * Use Case: Generar reporte de costos
 *
 * Genera un PDF comparativo entre el presupuesto y el costo real de un work plan.
 * Valida entradas, almacena el reporte y deja auditoría detallada.
 *
 * @file backend/src/app/reports/use-cases/GenerateCostReport.ts
 */
import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository.js';
import type { IPdfGeneratorService } from '../../../domain/services/IPdfGeneratorService.js';
import type { ICostCalculatorService } from '../../../domain/services/ICostCalculatorService.js';
import type { IFileStorageService } from '../../../domain/services/IFileStorageService.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';

const VALIDATION_LIMITS = {
  MAX_COST: 1_000_000_000, // Límite arbitrario de costos
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[GenerateCostReportUseCase]',
} as const;

const ERROR_MESSAGES = {
  MISSING_WORKPLAN_ID: 'El ID del plan de trabajo es requerido',
  WORKPLAN_NOT_FOUND: (id: string) => `Plan de trabajo ${id} no encontrado`,
  INVALID_COST: 'El costo real debe ser mayor o igual a 0',
  COST_TOO_HIGH: (max: number) => `El costo real no debe superar ${max}`,
  INVALID_BUDGET: 'El presupuesto estimado es inválido o nulo',
} as const;

interface GenerateCostReportInput {
  workPlanId: string;
  realCost: number;
  observations?: string;
  generatedBy: string;
  ip?: string;
  userAgent?: string;
}

interface GenerateCostReportOutput {
  pdfBuffer: Buffer;
  filePath: string;
  fileSize: number;
  generatedAt: Date;
  variance: number;
  variancePercentage: number;
  status: string;
}

interface AuditContext {
  ip: string;
  userAgent: string;
}

export class GenerateCostReportUseCase {
  constructor(
    private readonly workPlanRepository: IWorkPlanRepository,
    private readonly pdfGeneratorService: IPdfGeneratorService,
    private readonly costCalculatorService: ICostCalculatorService,
    private readonly fileStorageService: IFileStorageService,
    private readonly auditService: AuditService
  ) {}

  async execute(input: GenerateCostReportInput): Promise<GenerateCostReportOutput> {
    this.validateInput(input);

    const workPlan = await this.workPlanRepository.findById(input.workPlanId);
    if (!workPlan) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Plan de trabajo no encontrado`, { workPlanId: input.workPlanId });
      throw new Error(ERROR_MESSAGES.WORKPLAN_NOT_FOUND(input.workPlanId));
    }

    if (!workPlan.estimatedBudget || typeof workPlan.estimatedBudget !== 'number' || workPlan.estimatedBudget < 0) {
      throw new Error(ERROR_MESSAGES.INVALID_BUDGET);
    }

    // Cálculo del comparativo
    const varianceResult = this.costCalculatorService.calculateVariance(
      workPlan.estimatedBudget,
      input.realCost
    );

    if (Math.abs(input.realCost) > VALIDATION_LIMITS.MAX_COST) {
      throw new Error(ERROR_MESSAGES.COST_TOO_HIGH(VALIDATION_LIMITS.MAX_COST));
    }

    // Preparar datos para el PDF
    const costReportData = {
      workPlan,
      realCost: input.realCost,
      variance: varianceResult.variance,
      variancePercentage: varianceResult.variancePercentage,
      status: varianceResult.status,
      observations: input.observations,
      generatedAt: new Date(),
    };

    // Generar PDF
    const pdfBuffer = await this.pdfGeneratorService.generateCostComparisonReport(costReportData);

    // Guardar PDF en storage
    const fileName = `reporte-costos-${workPlan.id}-${Date.now()}.pdf`;
    const filePath = await this.fileStorageService.upload(fileName, pdfBuffer, 'application/pdf');

    // Registrar en auditoría
    const auditContext = this.extractAuditContext(input);
    await this.logCostReportGeneration(workPlan.id, input, filePath, costReportData, auditContext);

    logger.info(`${LOG_CONTEXT.USE_CASE} Reporte de costos generado exitosamente`, {
      workPlanId: workPlan.id,
      filePath,
      realCost: input.realCost,
      budgeted: workPlan.estimatedBudget,
      variance: varianceResult.variance,
      percentage: varianceResult.variancePercentage,
      status: varianceResult.status,
      generatedBy: input.generatedBy,
    });

    return {
      pdfBuffer,
      filePath,
      fileSize: pdfBuffer.length,
      generatedAt: new Date(),
      variance: varianceResult.variance,
      variancePercentage: varianceResult.variancePercentage,
      status: varianceResult.status,
    };
  }

  private validateInput(input: GenerateCostReportInput) {
    if (!input.workPlanId?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_WORKPLAN_ID);
    }

    if (input.realCost === undefined || input.realCost === null || isNaN(input.realCost)) {
      throw new Error(ERROR_MESSAGES.INVALID_COST);
    }
    if (input.realCost < 0) {
      throw new Error(ERROR_MESSAGES.INVALID_COST);
    }
    if (input.realCost > VALIDATION_LIMITS.MAX_COST) {
      throw new Error(ERROR_MESSAGES.COST_TOO_HIGH(VALIDATION_LIMITS.MAX_COST));
    }
    if (input.observations && input.observations.length > 1000) {
      throw new Error('Las observaciones no pueden exceder 1000 caracteres');
    }
    if (!input.generatedBy?.trim()) {
      throw new Error('Debe especificar el usuario que genera el reporte');
    }
  }

  private extractAuditContext(input: GenerateCostReportInput): AuditContext {
    return {
      ip: input.ip || 'unknown',
      userAgent: input.userAgent || 'unknown',
    };
  }

  private async logCostReportGeneration(
    workPlanId: string,
    input: GenerateCostReportInput,
    filePath: string,
    costReportData: any,
    auditContext: AuditContext
  ): Promise<void> {
    try {
      await this.auditService.log({
        entityType: 'WorkPlan',
        entityId: workPlanId,
        action: AuditAction.GENERATE_COST_REPORT,
        userId: input.generatedBy,
        before: null,
        after: {
          costReportGenerated: true,
          filePath,
          realCost: input.realCost,
          estimatedBudget: costReportData.workPlan.estimatedBudget,
          variance: costReportData.variance,
          variancePercentage: costReportData.variancePercentage,
          generatedAt: costReportData.generatedAt,
        },
        ip: auditContext.ip,
        userAgent: auditContext.userAgent,
        reason: `Reporte de costos generado. Observaciones: ${input.observations || 'N/A'}`,
      });
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error registrando auditoría de reporte de costos (no crítico)`, {
        workPlanId,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }
}

