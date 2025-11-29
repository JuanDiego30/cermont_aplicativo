import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository.js';
import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import type { IPdfGeneratorService } from '../../../domain/services/IPdfGeneratorService.js';
import type { IFileStorageService } from '../../../domain/services/IFileStorageService.js';
import type { WorkPlan } from '../../../domain/entities/WorkPlan.js';
import type { Order } from '../../../domain/entities/Order.js';
import { logger } from '../../../shared/utils/logger.js';

const ERROR_MESSAGES = {
  WORKPLAN_NOT_FOUND: (id: string) => `Plan de trabajo ${id} no encontrado`,
  ORDER_NOT_FOUND: 'Orden asociada al plan no encontrada',
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[GenerateWorkPlanPDFUseCase]',
} as const;

export interface GenerateWorkPlanPDFOutput {
  pdfBuffer: Buffer;
  filePath?: string;
  fileName: string;
  fileSize: number;
  generatedAt: Date;
}

export class GenerateWorkPlanPDFUseCase {
  constructor(
    private readonly workPlanRepository: IWorkPlanRepository,
    private readonly orderRepository: IOrderRepository,
    private readonly pdfGeneratorService: IPdfGeneratorService,
    private readonly fileStorageService?: IFileStorageService
  ) {}

  async execute(workPlanId: string): Promise<GenerateWorkPlanPDFOutput> {
    if (!workPlanId?.trim()) {
      throw new Error('ID del plan de trabajo requerido');
    }

    const workPlan = await this.workPlanRepository.findById(workPlanId);
    if (!workPlan) {
      throw new Error(ERROR_MESSAGES.WORKPLAN_NOT_FOUND(workPlanId));
    }

    const order = await this.orderRepository.findById(workPlan.orderId);
    if (!order) {
      throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND);
    }

    const pdfData = this.buildPdfData(workPlan, order);
    const pdfBuffer = await this.pdfGeneratorService.generateWorkPlanPDF(pdfData);

    const fileName = this.generateFileName(workPlan, order);
    const filePath = this.fileStorageService
      ? await this.fileStorageService.upload(fileName, pdfBuffer, 'application/pdf')
      : undefined;

    logger.debug(`${LOG_CONTEXT.USE_CASE} PDF generado`, {
      workPlanId,
      fileName,
      filePath,
      fileSize: pdfBuffer.length,
    });

    return {
      pdfBuffer,
      filePath,
      fileName,
      fileSize: pdfBuffer.length,
      generatedAt: new Date(),
    };
  }

  private buildPdfData(workPlan: WorkPlan, order: Order) {
    return {
      workPlan: {
        id: workPlan.id,
        orderId: workPlan.orderId,
        status: workPlan.status,
        materials: (workPlan.materials || []).map((m) => ({
          name: m.name,
          quantity: m.quantity,
          unitCost: m.unitCost,
        })),
        tools: (workPlan.tools || []).map((t) => ({
          name: t.name,
          quantity: t.quantity,
        })),
        equipment: (workPlan.equipment || []).map((e) => ({
          name: e.name,
          certification: e.certification,
        })),
        ppe: (workPlan.ppe || []).map((p) => ({
          name: p.name,
          quantity: p.quantity,
        })),
        tasks: (workPlan.tasks || []).map((t) => ({
          description: t.description,
          owner: t.owner,
          scheduledDate: t.scheduledDate,
        })),
        estimatedBudget: workPlan.estimatedBudget || 0,
        plannedWindow: workPlan.plannedWindow,
        notes: workPlan.notes,
      },
      order: {
        orderNumber: order.orderNumber,
        clientName: order.clientName,
        location: order.location,
        description: order.description,
      },
      generatedAt: new Date(),
    };
  }

  private calculateTotalCost(workPlan: WorkPlan): number {
    const materialsCost = (workPlan.materials || []).reduce(
      (sum, m) => sum + (m.quantity * m.unitCost),
      0
    );
    return materialsCost + (workPlan.estimatedBudget || 0);
  }

  private generateFileName(workPlan: WorkPlan, order: Order): string {
    const timestamp = new Date().toISOString().slice(0, 10);
    return `plan-trabajo-${order.orderNumber}-${timestamp}.pdf`;
  }
}

