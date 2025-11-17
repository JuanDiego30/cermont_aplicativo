/**
 * Use Case: Generar formato SES
 * Resuelve: Generaci�n de formato de seguridad, salud y medio ambiente
 * 
 * @file backend/src/app/reports/use-cases/GenerateSES.ts
 */

import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository.js';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { pdfGeneratorService, type SESData } from '../../../infra/services/PdfGeneratorService.js';
import { logger } from '../../../shared/utils/logger.js';
import {
  ObjectIdValidator,
  ObjectIdValidationError,
} from '../../../shared/validators/ObjectIdValidator.js';

/**
 * DTO para generar SES
 */
export interface GenerateSESDto {
  orderId: string;
  safetyChecklist: Array<{
    item: string;
    verified: boolean;
    observations?: string;
  }>;
  equipmentCertifications?: Array<{
    name: string;
    certNumber: string;
    expiryDate: Date;
  }>;
}

/**
 * Error de generaci�n
 */
export class GenerateSESError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'GenerateSESError';
  }
}

/**
 * Use Case: Generar SES
 * @class GenerateSES
 */
export class GenerateSES {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly workPlanRepository: IWorkPlanRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(dto: GenerateSESDto): Promise<Buffer> {
    try {
      // Validar orderId
      const validatedOrderId = ObjectIdValidator.validate(dto.orderId, 'ID de la orden');

      logger.info('[GenerateSES] Generando SES', { orderId: validatedOrderId });

      // 1. Obtener orden
      const order = await this.orderRepository.findById(validatedOrderId);

      if (!order) {
        throw new GenerateSESError(
          `Orden ${validatedOrderId} no encontrada`,
          'ORDER_NOT_FOUND',
          404
        );
      }

      // 2. Obtener plan de trabajo
      const workPlan = await this.workPlanRepository.findByOrderId(validatedOrderId);

      if (!workPlan) {
        throw new GenerateSESError(
          'No se encontr� plan de trabajo asociado',
          'WORKPLAN_NOT_FOUND',
          404
        );
      }

      // 3. Obtener t�cnico responsable
      let technician = { name: 'N/A', certifications: [] as string[] };
      
      if (order.responsibleId) {
        const user = await this.userRepository.findById(order.responsibleId);
        if (user) {
          technician = { name: user.name, certifications: [] };
        }
      }

      // 4. Preparar datos del SES
      const sesData: SESData = {
        order,
        workPlan,
        date: new Date(),
        technician,
        safetyChecklist: dto.safetyChecklist,
        equipmentCertifications: dto.equipmentCertifications || [],
        asts: workPlan.asts || [],
      };

      // 5. Generar PDF
      const pdfBuffer = await pdfGeneratorService.generateSES(sesData);

      logger.info('[GenerateSES] SES generado', {
        orderId: validatedOrderId,
        size: pdfBuffer.length,
      });

      return pdfBuffer;
    } catch (error) {
      if (error instanceof GenerateSESError || error instanceof ObjectIdValidationError) {
        throw error;
      }

      logger.error('[GenerateSES] Error inesperado', {
        error: error instanceof Error ? error.message : 'Unknown',
      });

      throw new GenerateSESError(
        'Error interno al generar SES',
        'INTERNAL_ERROR',
        500
      );
    }
  }
}
