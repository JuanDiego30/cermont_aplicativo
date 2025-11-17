/**
 * Estados posibles de un plan de trabajo
 */
export enum WorkPlanStatus {
  DRAFT = 'DRAFT',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

/**
 * Item de presupuesto detallado
 */
export interface WorkPlanBudgetLine {
  category: string;
  description?: string;
  amount: number;
}

/**
 * Tarea o hitos incluidos en el plan
 */
export interface WorkPlanTask {
  description: string;
  owner: string;
  scheduledDate: Date;
  estimatedHours?: number;
  completed: boolean;
}

/**
 * Archivo o documento asociado al plan
 */
export interface WorkPlanAttachment {
  id: string;
  name: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

/**
 * Reunión de seguridad vinculada al plan
 */
export interface WorkPlanSafetyMeeting {
  topic: string;
  facilitator: string;
  heldAt: Date;
  notes?: string;
}

/**
 * Material requerido en el plan de trabajo
 */
export interface WorkPlanMaterial {
  name: string;
  quantity: number;
  unitCost: number;
}

/**
 * Herramienta requerida en el plan de trabajo
 */
export interface WorkPlanTool {
  name: string;
  quantity: number;
}

/**
 * Equipo requerido en el plan de trabajo
 */
export interface WorkPlanEquipment {
  name: string;
  certification?: string;
}

/**
 * Elemento de protección personal (EPP)
 */
export interface WorkPlanPPE {
  name: string;
  quantity: number;
}

/**
 * Análisis Seguro de Trabajo (AST)
 */
export interface WorkPlanAST {
  activity: string;
  risks: string[];
  controls: string[];
}

/**
 * Item de checklist del plan de trabajo
 */
export interface WorkPlanChecklistItem {
  item: string;
  completed: boolean;
}

/**
 * Entidad: Plan de Trabajo
 * Representa la planificación de recursos, seguridad y presupuesto para una orden
 */
export interface WorkPlan extends Record<string, unknown> {
  id: string;
  orderId: string;
  status: WorkPlanStatus;
  materials: WorkPlanMaterial[];
  tools: WorkPlanTool[];
  equipment: WorkPlanEquipment[];
  ppe: WorkPlanPPE[];
  asts: WorkPlanAST[];
  checklists: WorkPlanChecklistItem[];
  estimatedBudget: number;
  budgetBreakdown?: WorkPlanBudgetLine[];
  tasks?: WorkPlanTask[];
  attachments?: WorkPlanAttachment[];
  safetyMeetings?: WorkPlanSafetyMeeting[];
  assignedTeam?: string;
  plannedStart?: Date;
  plannedEnd?: Date;
  actualStart?: Date;
  actualEnd?: Date;
  notes?: string;
  createdBy: string;
  
  // === Campos de aprobación ===
  approvedBy?: string;
  approvedAt?: Date;
  approvalComments?: string;
  
  // === Campos de rechazo ===
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

