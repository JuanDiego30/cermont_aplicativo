/**
 * Use Case: Generar acta de entrega
 * Resuelve: Generación de acta de entrega formal
 * 
 * @file backend/src/app/reports/use-cases/GenerateActaEntrega.ts
 */

import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { pdfGeneratorService, type ActaEntregaData } from '../../../infra/services/PdfGeneratorService';
import { logger } from '../../../shared/utils/logger';
import {
  ObjectIdValidator,
  ObjectIdValidationError,
} from '../../../shared/validators/ObjectIdValidator';

/**
 * DTO para generar acta
 */
export interface GenerateActaEntregaDto {
  orderId: string;
  clientRepresentative: string;
  clientIdNumber: string;
  deliveredItems: Array<{
    description: string;
    quantity: number;
    condition: string;
  }>;
  observations?: string;
}

/**
 * Error de generación
 */
export class GenerateActaEntregaError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'GenerateActaEntregaError';
  }
}

/**
 * Use Case: Generar Acta de Entrega
 * @class GenerateActaEntrega
 */
export class GenerateActaEntrega {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(dto: GenerateActaEntregaDto): Promise<Buffer> {
    try {
      // Validar orderId
      const validatedOrderId = ObjectIdValidator.validate(dto.orderId, 'ID de la orden');

      logger.info('[GenerateActaEntrega] Generando acta', { orderId: validatedOrderId });

      // 1. Obtener orden
      const order = await this.orderRepository.findById(validatedOrderId);

      if (!order) {
        throw new GenerateActaEntregaError(
          `Orden ${validatedOrderId} no encontrada`,
          'ORDER_NOT_FOUND',
          404
        );
      }

      // 2. Obtener técnico responsable
      let technician = { name: 'N/A', role: 'N/A' };
      
      if (order.responsibleId) {
        const user = await this.userRepository.findById(order.responsibleId);
        if (user) {
          technician = { name: user.name, role: user.role };
        }
      }

      // 3. Preparar datos del acta
      const actaData: ActaEntregaData = {
        order,
        deliveryDate: new Date(),
        client: {
          name: order.clientName,
          representative: dto.clientRepresentative,
          idNumber: dto.clientIdNumber,
        },
        technician,
        deliveredItems: dto.deliveredItems,
        observations: dto.observations,
        signatures: {
          client: false,
          technician: false,
        },
      };

      // 4. Generar PDF
      const pdfBuffer = await pdfGeneratorService.generateActaEntrega(actaData);

      logger.info('[GenerateActaEntrega] Acta generada', {
        orderId: validatedOrderId,
        size: pdfBuffer.length,
      });

      return pdfBuffer;
    } catch (error) {
      if (error instanceof GenerateActaEntregaError || error instanceof ObjectIdValidationError) {
        throw error;
      }

      logger.error('[GenerateActaEntrega] Error inesperado', {
        error: error instanceof Error ? error.message : 'Unknown',
      });

      throw new GenerateActaEntregaError(
        'Error interno al generar acta',
        'INTERNAL_ERROR',
        500
      );
    }
  }
}
