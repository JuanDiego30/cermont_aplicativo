import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository';
import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import type { WorkPlan } from '../../../domain/entities/WorkPlan';
import { WorkPlanStatus } from '../../../domain/entities/WorkPlan';

export class WorkPlanCreationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'WorkPlanCreationError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      Object.setPrototypeOf(this, new.target.prototype);
    }
  }
}

export interface Material {
  name: string;
  quantity: number;
  unitCost: number;
}

export interface Tool {
  name: string;
  quantity: number;
}

export interface Equipment {
  name: string;
  certification?: string;
}

export interface PPE {
  name: string;
  quantity: number;
}

export interface AST {
  activity: string;
  risks: string[];
  controls: string[];
}

export interface ChecklistItem {
  item: string;
  completed: boolean;
}

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
}

export class CreateWorkPlan {
  private static readonly MAX_MATERIALS = 100;
  private static readonly MAX_TOOLS = 50;
  private static readonly MAX_EQUIPMENT = 30;
  private static readonly MAX_PPE = 20;
  private static readonly MAX_ASTS = 50;
  private static readonly MAX_CHECKLISTS = 100;
  private static readonly MAX_BUDGET = 1_000_000_000;
  private static readonly MAX_QUANTITY = 10_000;
  private static readonly MAX_UNIT_COST = 100_000_000;
  private static readonly MAX_NAME_LENGTH = 200;
  private static readonly MAX_ACTIVITY_LENGTH = 500;
  private static readonly MAX_CERTIFICATION_LENGTH = 500;
  private static readonly MAX_ITEM_LENGTH = 500;
  private static readonly OBJECTID_REGEX = /^[a-f\d]{24}$/i;

  constructor(
    private readonly workPlanRepository: IWorkPlanRepository,
    private readonly orderRepository: IOrderRepository
  ) {}

  async execute(input: CreateWorkPlanInput): Promise<WorkPlan> {
    try {
      this.validateInput(input);

      const order = await this.orderRepository.findById(input.orderId);

      if (!order) {
        throw new WorkPlanCreationError(
          `Orden con ID ${input.orderId} no encontrada`,
          'ORDER_NOT_FOUND',
          404
        );
      }

      const existing = await this.workPlanRepository.findByOrderId(input.orderId);

      if (existing) {
        throw new WorkPlanCreationError(
          'Ya existe un plan de trabajo para esta orden',
          'WORKPLAN_ALREADY_EXISTS',
          409
        );
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

      console.info(
        `[CreateWorkPlan] Plan de trabajo creado: ${workPlan.id} para orden ${input.orderId}`
      );
      console.info(
        `[CreateWorkPlan] Presupuesto estimado: $${input.estimatedBudget.toLocaleString()}`
      );
      console.info(
        `[CreateWorkPlan] Componentes: ${input.materials.length} materiales, ${input.tools.length} herramientas, ${input.asts.length} ASTs`
      );

      return workPlan;
    } catch (error: unknown) {
      if (error instanceof WorkPlanCreationError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('[CreateWorkPlan] Error inesperado:', errorMessage);

      throw new Error('Error interno al crear el plan de trabajo');
    }
  }

  private validateInput(input: CreateWorkPlanInput): void {
    this.validateOrderId(input.orderId);
    this.validateMaterials(input.materials);
    this.validateTools(input.tools);
    this.validateEquipment(input.equipment);
    this.validatePPE(input.ppe);
    this.validateASTs(input.asts);

    if (input.checklists !== undefined) {
      this.validateChecklists(input.checklists);
    }

    this.validateBudget(input.estimatedBudget);

    if (!input.createdBy || typeof input.createdBy !== 'string' || input.createdBy.trim() === '') {
      throw new WorkPlanCreationError(
        'El ID del usuario creador es requerido',
        'INVALID_CREATED_BY',
        400
      );
    }
  }

  private validateOrderId(orderId: string): void {
    if (!orderId || typeof orderId !== 'string' || orderId.trim() === '') {
      throw new WorkPlanCreationError(
        'El ID de la orden es requerido',
        'INVALID_ORDER_ID',
        400
      );
    }

    if (!CreateWorkPlan.OBJECTID_REGEX.test(orderId.trim())) {
      throw new WorkPlanCreationError(
        `El ID de la orden tiene un formato invalido: ${orderId}`,
        'INVALID_ORDER_ID_FORMAT',
        400
      );
    }
  }

  private validateMaterials(materials: Material[]): void {
    if (!Array.isArray(materials)) {
      throw new WorkPlanCreationError(
        'Los materiales deben ser un array',
        'INVALID_MATERIALS_TYPE',
        400
      );
    }

    if (materials.length === 0) {
      throw new WorkPlanCreationError(
        'Debe proporcionar al menos un material',
        'MATERIALS_REQUIRED',
        400
      );
    }

    if (materials.length > CreateWorkPlan.MAX_MATERIALS) {
      throw new WorkPlanCreationError(
        `No se pueden agregar mas de ${CreateWorkPlan.MAX_MATERIALS} materiales`,
        'TOO_MANY_MATERIALS',
        400
      );
    }

    materials.forEach((material, index) => {
      const position = index + 1;

      if (!material.name || typeof material.name !== 'string' || material.name.trim() === '') {
        throw new WorkPlanCreationError(
          `Material ${position}: El nombre es requerido`,
          'MATERIAL_NAME_REQUIRED',
          400
        );
      }

      if (material.name.trim().length > CreateWorkPlan.MAX_NAME_LENGTH) {
        throw new WorkPlanCreationError(
          `Material ${position}: El nombre no puede exceder ${CreateWorkPlan.MAX_NAME_LENGTH} caracteres`,
          'MATERIAL_NAME_TOO_LONG',
          400
        );
      }

      if (typeof material.quantity !== 'number' || material.quantity <= 0) {
        throw new WorkPlanCreationError(
          `Material ${position}: La cantidad debe ser mayor a 0`,
          'INVALID_MATERIAL_QUANTITY',
          400
        );
      }

      if (!Number.isInteger(material.quantity)) {
        throw new WorkPlanCreationError(
          `Material ${position}: La cantidad debe ser un numero entero`,
          'MATERIAL_QUANTITY_NOT_INTEGER',
          400
        );
      }

      if (material.quantity > CreateWorkPlan.MAX_QUANTITY) {
        throw new WorkPlanCreationError(
          `Material ${position}: La cantidad no puede exceder ${CreateWorkPlan.MAX_QUANTITY}`,
          'MATERIAL_QUANTITY_TOO_LARGE',
          400
        );
      }

      if (typeof material.unitCost !== 'number' || material.unitCost <= 0) {
        throw new WorkPlanCreationError(
          `Material ${position}: El costo unitario debe ser mayor a 0`,
          'INVALID_MATERIAL_UNIT_COST',
          400
        );
      }

      if (material.unitCost > CreateWorkPlan.MAX_UNIT_COST) {
        throw new WorkPlanCreationError(
          `Material ${position}: El costo unitario no puede exceder $${CreateWorkPlan.MAX_UNIT_COST.toLocaleString()}`,
          'MATERIAL_UNIT_COST_TOO_LARGE',
          400
        );
      }
    });
  }

  private validateTools(tools: Tool[]): void {
    if (!Array.isArray(tools)) {
      throw new WorkPlanCreationError(
        'Las herramientas deben ser un array',
        'INVALID_TOOLS_TYPE',
        400
      );
    }

    if (tools.length === 0) {
      throw new WorkPlanCreationError(
        'Debe proporcionar al menos una herramienta',
        'TOOLS_REQUIRED',
        400
      );
    }

    if (tools.length > CreateWorkPlan.MAX_TOOLS) {
      throw new WorkPlanCreationError(
        `No se pueden agregar mas de ${CreateWorkPlan.MAX_TOOLS} herramientas`,
        'TOO_MANY_TOOLS',
        400
      );
    }

    tools.forEach((tool, index) => {
      const position = index + 1;

      if (!tool.name || typeof tool.name !== 'string' || tool.name.trim() === '') {
        throw new WorkPlanCreationError(
          `Herramienta ${position}: El nombre es requerido`,
          'TOOL_NAME_REQUIRED',
          400
        );
      }

      if (tool.name.trim().length > CreateWorkPlan.MAX_NAME_LENGTH) {
        throw new WorkPlanCreationError(
          `Herramienta ${position}: El nombre no puede exceder ${CreateWorkPlan.MAX_NAME_LENGTH} caracteres`,
          'TOOL_NAME_TOO_LONG',
          400
        );
      }

      if (typeof tool.quantity !== 'number' || tool.quantity <= 0) {
        throw new WorkPlanCreationError(
          `Herramienta ${position}: La cantidad debe ser mayor a 0`,
          'INVALID_TOOL_QUANTITY',
          400
        );
      }

      if (!Number.isInteger(tool.quantity)) {
        throw new WorkPlanCreationError(
          `Herramienta ${position}: La cantidad debe ser un numero entero`,
          'TOOL_QUANTITY_NOT_INTEGER',
          400
        );
      }

      if (tool.quantity > CreateWorkPlan.MAX_QUANTITY) {
        throw new WorkPlanCreationError(
          `Herramienta ${position}: La cantidad no puede exceder ${CreateWorkPlan.MAX_QUANTITY}`,
          'TOOL_QUANTITY_TOO_LARGE',
          400
        );
      }
    });
  }

  private validateEquipment(equipment: Equipment[]): void {
    if (!Array.isArray(equipment)) {
      throw new WorkPlanCreationError(
        'Los equipos deben ser un array',
        'INVALID_EQUIPMENT_TYPE',
        400
      );
    }

    if (equipment.length === 0) {
      throw new WorkPlanCreationError(
        'Debe proporcionar al menos un equipo',
        'EQUIPMENT_REQUIRED',
        400
      );
    }

    if (equipment.length > CreateWorkPlan.MAX_EQUIPMENT) {
      throw new WorkPlanCreationError(
        `No se pueden agregar mas de ${CreateWorkPlan.MAX_EQUIPMENT} equipos`,
        'TOO_MANY_EQUIPMENT',
        400
      );
    }

    equipment.forEach((equip, index) => {
      const position = index + 1;

      if (!equip.name || typeof equip.name !== 'string' || equip.name.trim() === '') {
        throw new WorkPlanCreationError(
          `Equipo ${position}: El nombre es requerido`,
          'EQUIPMENT_NAME_REQUIRED',
          400
        );
      }

      if (equip.name.trim().length > CreateWorkPlan.MAX_NAME_LENGTH) {
        throw new WorkPlanCreationError(
          `Equipo ${position}: El nombre no puede exceder ${CreateWorkPlan.MAX_NAME_LENGTH} caracteres`,
          'EQUIPMENT_NAME_TOO_LONG',
          400
        );
      }

      if (equip.certification !== undefined) {
        if (typeof equip.certification !== 'string' || equip.certification.trim() === '') {
          throw new WorkPlanCreationError(
            `Equipo ${position}: La certificacion debe ser una cadena no vacia`,
            'INVALID_EQUIPMENT_CERTIFICATION',
            400
          );
        }

        if (equip.certification.trim().length > CreateWorkPlan.MAX_CERTIFICATION_LENGTH) {
          throw new WorkPlanCreationError(
            `Equipo ${position}: La certificacion no puede exceder ${CreateWorkPlan.MAX_CERTIFICATION_LENGTH} caracteres`,
            'EQUIPMENT_CERTIFICATION_TOO_LONG',
            400
          );
        }
      }
    });
  }

  private validatePPE(ppe: PPE[]): void {
    if (!Array.isArray(ppe)) {
      throw new WorkPlanCreationError(
        'Los EPPs deben ser un array',
        'INVALID_PPE_TYPE',
        400
      );
    }

    if (ppe.length === 0) {
      throw new WorkPlanCreationError(
        'Debe proporcionar al menos un EPP',
        'PPE_REQUIRED',
        400
      );
    }

    if (ppe.length > CreateWorkPlan.MAX_PPE) {
      throw new WorkPlanCreationError(
        `No se pueden agregar mas de ${CreateWorkPlan.MAX_PPE} EPPs`,
        'TOO_MANY_PPE',
        400
      );
    }

    ppe.forEach((item, index) => {
      const position = index + 1;

      if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
        throw new WorkPlanCreationError(
          `EPP ${position}: El nombre es requerido`,
          'PPE_NAME_REQUIRED',
          400
        );
      }

      if (item.name.trim().length > CreateWorkPlan.MAX_NAME_LENGTH) {
        throw new WorkPlanCreationError(
          `EPP ${position}: El nombre no puede exceder ${CreateWorkPlan.MAX_NAME_LENGTH} caracteres`,
          'PPE_NAME_TOO_LONG',
          400
        );
      }

      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        throw new WorkPlanCreationError(
          `EPP ${position}: La cantidad debe ser mayor a 0`,
          'INVALID_PPE_QUANTITY',
          400
        );
      }

      if (!Number.isInteger(item.quantity)) {
        throw new WorkPlanCreationError(
          `EPP ${position}: La cantidad debe ser un numero entero`,
          'PPE_QUANTITY_NOT_INTEGER',
          400
        );
      }

      if (item.quantity > CreateWorkPlan.MAX_QUANTITY) {
        throw new WorkPlanCreationError(
          `EPP ${position}: La cantidad no puede exceder ${CreateWorkPlan.MAX_QUANTITY}`,
          'PPE_QUANTITY_TOO_LARGE',
          400
        );
      }
    });
  }

  private validateASTs(asts: AST[]): void {
    if (!Array.isArray(asts)) {
      throw new WorkPlanCreationError(
        'Los ASTs deben ser un array',
        'INVALID_ASTS_TYPE',
        400
      );
    }

    if (asts.length === 0) {
      throw new WorkPlanCreationError(
        'Debe proporcionar al menos un AST',
        'ASTS_REQUIRED',
        400
      );
    }

    if (asts.length > CreateWorkPlan.MAX_ASTS) {
      throw new WorkPlanCreationError(
        `No se pueden agregar mas de ${CreateWorkPlan.MAX_ASTS} ASTs`,
        'TOO_MANY_ASTS',
        400
      );
    }

    asts.forEach((ast, index) => {
      const position = index + 1;

      if (!ast.activity || typeof ast.activity !== 'string' || ast.activity.trim() === '') {
        throw new WorkPlanCreationError(
          `AST ${position}: La actividad es requerida`,
          'AST_ACTIVITY_REQUIRED',
          400
        );
      }

      if (ast.activity.trim().length > CreateWorkPlan.MAX_ACTIVITY_LENGTH) {
        throw new WorkPlanCreationError(
          `AST ${position}: La actividad no puede exceder ${CreateWorkPlan.MAX_ACTIVITY_LENGTH} caracteres`,
          'AST_ACTIVITY_TOO_LONG',
          400
        );
      }

      if (!Array.isArray(ast.risks) || ast.risks.length === 0) {
        throw new WorkPlanCreationError(
          `AST ${position}: Debe proporcionar al menos un riesgo`,
          'AST_RISKS_REQUIRED',
          400
        );
      }

      ast.risks.forEach((risk, riskIndex) => {
        if (typeof risk !== 'string' || risk.trim() === '') {
          throw new WorkPlanCreationError(
            `AST ${position}, Riesgo ${riskIndex + 1}: Debe ser una cadena no vacia`,
            'AST_RISK_INVALID',
            400
          );
        }

        if (risk.trim().length > CreateWorkPlan.MAX_ACTIVITY_LENGTH) {
          throw new WorkPlanCreationError(
            `AST ${position}, Riesgo ${riskIndex + 1}: No puede exceder ${CreateWorkPlan.MAX_ACTIVITY_LENGTH} caracteres`,
            'AST_RISK_TOO_LONG',
            400
          );
        }
      });

      if (!Array.isArray(ast.controls) || ast.controls.length === 0) {
        throw new WorkPlanCreationError(
          `AST ${position}: Debe proporcionar al menos un control`,
          'AST_CONTROLS_REQUIRED',
          400
        );
      }

      ast.controls.forEach((control, controlIndex) => {
        if (typeof control !== 'string' || control.trim() === '') {
          throw new WorkPlanCreationError(
            `AST ${position}, Control ${controlIndex + 1}: Debe ser una cadena no vacia`,
            'AST_CONTROL_INVALID',
            400
          );
        }

        if (control.trim().length > CreateWorkPlan.MAX_ACTIVITY_LENGTH) {
          throw new WorkPlanCreationError(
            `AST ${position}, Control ${controlIndex + 1}: No puede exceder ${CreateWorkPlan.MAX_ACTIVITY_LENGTH} caracteres`,
            'AST_CONTROL_TOO_LONG',
            400
          );
        }
      });
    });
  }

  private validateChecklists(checklists: ChecklistItem[]): void {
    if (!Array.isArray(checklists)) {
      throw new WorkPlanCreationError(
        'Los checklists deben ser un array',
        'INVALID_CHECKLISTS_TYPE',
        400
      );
    }

    if (checklists.length > CreateWorkPlan.MAX_CHECKLISTS) {
      throw new WorkPlanCreationError(
        `No se pueden agregar mas de ${CreateWorkPlan.MAX_CHECKLISTS} items de checklist`,
        'TOO_MANY_CHECKLISTS',
        400
      );
    }

    checklists.forEach((item, index) => {
      const position = index + 1;

      if (!item.item || typeof item.item !== 'string' || item.item.trim() === '') {
        throw new WorkPlanCreationError(
          `Checklist ${position}: El item es requerido`,
          'CHECKLIST_ITEM_REQUIRED',
          400
        );
      }

      if (item.item.trim().length > CreateWorkPlan.MAX_ITEM_LENGTH) {
        throw new WorkPlanCreationError(
          `Checklist ${position}: El item no puede exceder ${CreateWorkPlan.MAX_ITEM_LENGTH} caracteres`,
          'CHECKLIST_ITEM_TOO_LONG',
          400
        );
      }

      if (typeof item.completed !== 'boolean') {
        throw new WorkPlanCreationError(
          `Checklist ${position}: El campo completed debe ser un booleano`,
          'CHECKLIST_COMPLETED_INVALID',
          400
        );
      }
    });
  }

  private validateBudget(budget: number): void {
    if (typeof budget !== 'number') {
      throw new WorkPlanCreationError(
        'El presupuesto estimado debe ser un numero',
        'INVALID_BUDGET_TYPE',
        400
      );
    }

    if (Number.isNaN(budget)) {
      throw new WorkPlanCreationError(
        'El presupuesto estimado no es un numero valido',
        'INVALID_BUDGET_VALUE',
        400
      );
    }

    if (budget <= 0) {
      throw new WorkPlanCreationError(
        'El presupuesto estimado debe ser mayor a 0',
        'BUDGET_TOO_SMALL',
        400
      );
    }

    if (budget > CreateWorkPlan.MAX_BUDGET) {
      throw new WorkPlanCreationError(
        `El presupuesto estimado no puede exceder $${CreateWorkPlan.MAX_BUDGET.toLocaleString()}`,
        'BUDGET_TOO_LARGE',
        400
      );
    }
  }
}

