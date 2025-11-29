/**
 * WorkPlan Types
 */

export enum WorkPlanStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export type Material = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  supplier?: string;
  notes?: string;
};

export type Tool = {
  id: string;
  name: string;
  quantity: number;
  certification?: string;
  certificationExpiry?: string;
};

export type Equipment = {
  id: string;
  name: string;
  model?: string;
  serialNumber?: string;
  certification?: string;
  certificationExpiry?: string;
  nextMaintenance?: string;
};

export type PPE = {
  id: string;
  name: string;
  quantity: number;
  standard?: string;
};

export type SafetyTask = {
  id: string;
  task: string;
  hazards: string[];
  controls: string[];
  responsible: string;
};

export type ChecklistItem = {
  id: string;
  description: string;
  required: boolean;
  completed?: boolean;
  notes?: string;
};

export type WorkPlan = {
  id: string;
  orderId: string;
  orderCode: string;
  title: string;
  description: string;
  status: WorkPlanStatus;
  materials: Material[];
  tools: Tool[];
  equipment: Equipment[];
  ppe: PPE[];
  safetyTasks: SafetyTask[];
  checklist: ChecklistItem[];
  assignedTechnicians: string[];
  supervisor?: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
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
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
};

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

export type UpdateWorkPlanDTO = Partial<CreateWorkPlanDTO>;
export type ApproveWorkPlanDTO = { comments?: string };
export type RejectWorkPlanDTO = { reason: string };
export type UpdateBudgetDTO = { materials: number; labor: number; overhead?: number };

export type BudgetComparison = {
  estimated: { materials: number; labor: number; overhead: number; total: number };
  actual: { materials: number; labor: number; overhead: number; total: number };
  difference: { materials: number; labor: number; overhead: number; total: number; percentage: number };
  isOverBudget: boolean;
};
