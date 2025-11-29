import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository.js';
import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import type { WorkPlan } from '../../../domain/entities/WorkPlan.js';
import { WorkPlanStatus } from '../../../domain/entities/WorkPlan.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';

const CONFIG = {
  LIMITS: {
    MATERIALS: 100,
    TOOLS: 50,
    EQUIPMENT: 30,
    PPE: 20,
    ASTS: 50,
    CHECKLISTS: 100,
    BUDGET_MAX: 1_000_000_000,
    QUANTITY_MAX: 10_000,
    UNIT_COST_MAX: 100_000_000,
    TEXT_SHORT: 200,
    TEXT_LONG: 500,
  },
} as const;

const ERROR_MESSAGES = {
  ORDER_NOT_FOUND: (id: string) => `Orden con ID ${id} no encontrada`,
  WORKPLAN_EXISTS: 'Ya existe un plan de trabajo para esta orden',
  INVALID_ID: 'ID inválido',
  INVALID_BUDGET: `El presupuesto debe estar entre 0 y ${CONFIG.LIMITS.BUDGET_MAX}`,
  LIST_EMPTY: (name: string) => `Debe proporcionar al menos un ${name}`,
  LIST_TOO_LONG: (name: string, max: number) => `No se pueden agregar más de ${max} ${name}`,
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[CreateWorkPlanUseCase]',
} as const;

// Interfaces (DTOs) reutilizadas del original
export interface Material { name: string; quantity: number; unitCost: number; }
export interface Tool { name: string; quantity: number; }
export interface Equipment { name: string; certification?: string; }
export interface PPE { name: string; quantity: number; }
export interface AST { activity: string; risks: string[]; controls: string[]; }
export interface ChecklistItem { item: string; completed: boolean; }

export interface CreateWorkPlanInput {
  orderId: string;
  materials: Material[];
  tools: Tool[];
  equipment: Equipment[];
  ppe: PPE[];
  asts: AST[];
  checklists?: ChecklistItem[];
  estimatedBudget: number;
  createdBy: string;
  ip?: string;
  userAgent?: string;
}

export class CreateWorkPlanUseCase {
  constructor(
    private readonly workPlanRepository: IWorkPlanRepository,
    private readonly orderRepository: IOrderRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(input: CreateWorkPlanInput): Promise<WorkPlan> {
    this.validateInput(input);

    const order = await this.orderRepository.findById(input.orderId);
    if (!order) {
      throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND(input.orderId));
    }

    const existing = await this.workPlanRepository.findByOrderId(input.orderId);
    if (existing) {
      throw new Error(ERROR_MESSAGES.WORKPLAN_EXISTS);
    }

    const workPlan = await this.workPlanRepository.create({
      orderId: input.orderId,
      materials: input.materials,
      tools: input.tools,
      equipment: input.equipment,
      ppe: input.ppe,
      asts: input.asts,
      checklists: input.checklists ?? [],
      estimatedBudget: input.estimatedBudget,
      status: WorkPlanStatus.DRAFT,
      createdBy: input.createdBy.trim(),
    });

    await this.logAudit(workPlan, input);

    logger.info(`${LOG_CONTEXT.USE_CASE} Plan de trabajo creado exitosamente`, {
      workPlanId: workPlan.id,
      orderId: input.orderId,
      budget: input.estimatedBudget,
      components: {
        materials: input.materials.length,
        tools: input.tools.length,
        asts: input.asts.length,
      },
    });

    return workPlan;
  }

  private validateInput(input: CreateWorkPlanInput): void {
    if (!input.orderId?.trim()) throw new Error(ERROR_MESSAGES.INVALID_ID);
    if (!input.createdBy?.trim()) throw new Error('ID de usuario creador requerido');

    this.validateList(input.materials, 'Material', CONFIG.LIMITS.MATERIALS);
    this.validateList(input.tools, 'Herramienta', CONFIG.LIMITS.TOOLS);
    this.validateList(input.equipment, 'Equipo', CONFIG.LIMITS.EQUIPMENT);
    this.validateList(input.ppe, 'EPP', CONFIG.LIMITS.PPE);
    this.validateList(input.asts, 'AST', CONFIG.LIMITS.ASTS);
    
    if (input.checklists) {
      this.validateList(input.checklists, 'Checklist', CONFIG.LIMITS.CHECKLISTS, true);
    }

    if (input.estimatedBudget <= 0 || input.estimatedBudget > CONFIG.LIMITS.BUDGET_MAX) {
      throw new Error(ERROR_MESSAGES.INVALID_BUDGET);
    }
  }

  private validateList<T>(list: T[], name: string, max: number, allowEmpty = false): void {
    if (!Array.isArray(list)) throw new Error(`${name}s debe ser un array`);
    if (!allowEmpty && list.length === 0) throw new Error(ERROR_MESSAGES.LIST_EMPTY(name));
    if (list.length > max) throw new Error(ERROR_MESSAGES.LIST_TOO_LONG(name, max));
    
    // Aquí se podría delegar la validación detallada de cada item a un validador específico si fuera necesario
    // para mantener este método genérico y limpio.
  }

  private async logAudit(workPlan: WorkPlan, input: CreateWorkPlanInput): Promise<void> {
    await this.auditService.logCreate(
      'WorkPlan',
      workPlan.id,
      input.createdBy,
      workPlan as unknown as Record<string, unknown>,
      input.ip || 'unknown',
      input.userAgent
    );
  }
}


