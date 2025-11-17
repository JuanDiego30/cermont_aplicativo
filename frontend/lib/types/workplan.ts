/**
 * Estados de un plan de trabajo
 */
export enum WorkPlanStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

/**
 * Material requerido
 */
export type Material = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  supplier?: string;
  notes?: string;
};

/**
 * Herramienta requerida
 */
export type Tool = {
  id: string;
  name: string;
  quantity: number;
  certification?: string;
  certificationExpiry?: string;
};

/**
 * Equipo requerido
 */
export type Equipment = {
  id: string;
  name: string;
  model?: string;
  serialNumber?: string;
  certification?: string;
  certificationExpiry?: string;
  nextMaintenance?: string;
};

/**
 * EPP (Equipo de Protecci�n Personal)
 */
export type PPE = {
  id: string;
  name: string;
  quantity: number;
  standard?: string;
};

/**
 * AST (An�lisis de Trabajo Seguro)
 */
export type SafetyTask = {
  id: string;
  task: string;
  hazards: string[];
  controls: string[];
  responsible: string;
};

/**
 * Item de Checklist
 */
export type ChecklistItem = {
  id: string;
  description: string;
  required: boolean;
  completed?: boolean;
  notes?: string;
};

/**
 * Plan de Trabajo Completo
 */
export type WorkPlan = {
  id: string;
  orderId: string;
  orderCode: string;
  title: string;
  description: string;
  status: WorkPlanStatus;

  // Recursos
  materials: Material[];
  tools: Tool[];
  equipment: Equipment[];
  ppe: PPE[];

  // Seguridad y Calidad
  safetyTasks: SafetyTask[];
  checklist: ChecklistItem[];

  // Personal
  assignedTechnicians: string[];
  supervisor?: string;

  // Fechas
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;

  // Presupuesto
  estimatedBudget: {
    materials: number;
    labor: number;
    overhead: number;
    total: number;
  };
  actualBudget?: {
    materials: number;
    labor: number;
    overhead: number;
    total: number;
  };

  // Aprobaci�n
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;

  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
};

/**
 * DTO para crear plan de trabajo
 */
export type CreateWorkPlanDTO = {
  orderId: string;
  title: string;
  description: string;
  materials: Omit<Material, 'id'>[];
  tools: Omit<Tool, 'id'>[];
  equipment: Omit<Equipment, 'id'>[];
  ppe: Omit<PPE, 'id'>[];
  safetyTasks: Omit<SafetyTask, 'id'>[];
  checklist: Omit<ChecklistItem, 'id'>[];
  assignedTechnicians: string[];
  supervisor?: string;
  plannedStartDate: string;
  plannedEndDate: string;
};

/**
 * DTO para actualizar plan de trabajo
 */
export type UpdateWorkPlanDTO = Partial<CreateWorkPlanDTO>;

/**
 * DTO para aprobar plan
 */
export type ApproveWorkPlanDTO = {
  comments?: string;
};

/**
 * DTO para rechazar plan
 */
export type RejectWorkPlanDTO = {
  reason: string;
};

/**
 * DTO para actualizar presupuesto
 */
export type UpdateBudgetDTO = {
  materials: number;
  labor: number;
  overhead?: number;
};

/**
 * Comparaci�n de presupuesto
 */
export type BudgetComparison = {
  estimated: {
    materials: number;
    labor: number;
    overhead: number;
    total: number;
  };
  actual: {
    materials: number;
    labor: number;
    overhead: number;
    total: number;
  };
  difference: {
    materials: number;
    labor: number;
    overhead: number;
    total: number;
    percentage: number;
  };
  isOverBudget: boolean;
};

