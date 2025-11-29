import { WorkPlanStatus } from './WorkPlanStatus.js';

// Re-exportar para uso externo
export { WorkPlanStatus };

// Interfaces de Componentes (Reutilizadas del UseCase de CreateWorkPlan para consistencia)
export interface Material { name: string; quantity: number; unitCost: number; }
export interface Tool { name: string; quantity: number; }
export interface Equipment { name: string; certification?: string; }
export interface PPE { name: string; quantity: number; }
export interface ChecklistItem { item: string; completed: boolean; }

/**
 * Análisis de Seguridad en el Trabajo (AST)
 * Define riesgos y controles por actividad específica.
 */
export interface ActivityRiskAnalysis {
  activity: string;
  risks: string[];
  controls: string[];
}

/**
 * Análisis de Riesgos Generales del Sitio/Entorno
 * (Diferente del AST que es por actividad)
 */
export interface SiteRiskAnalysis {
  hazard: string;      // Peligro (ej: Altura)
  risk: string;        // Riesgo (ej: Caída)
  controls: string;    // Medida de control
}

export interface BudgetLine {
  category: string;
  description?: string;
  amount: number;
}

export interface Task {
  description: string;
  owner: string;
  scheduledDate: Date;
  completed: boolean;
  estimatedHours?: number;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface ExecutionWindow {
  start: Date;
  end: Date;
}

/**
 * Entidad: Plan de Trabajo
 * Define la estrategia operativa para ejecutar una orden.
 */
export interface WorkPlan {
  id: string;
  orderId: string;
  status: WorkPlanStatus;

  // --- Recursos ---
  materials: Material[];
  tools: Tool[];
  equipment: Equipment[];
  ppe: PPE[];

  // --- Seguridad ---
  asts: ActivityRiskAnalysis[];         // Específico de actividades
  riskAnalysis?: SiteRiskAnalysis[];    // General del entorno
  checklists: ChecklistItem[];
  safetyMeetings?: Array<{
    topic: string;
    facilitator: string;
    heldAt: Date;
    notes?: string;
  }>;

  // --- Planificación ---
  tasks?: Task[];
  assignedTeam?: string; // Opcional, si difiere de la orden
  
  // Ventanas de tiempo
  plannedWindow?: ExecutionWindow;
  actualWindow?: ExecutionWindow;

  // --- Finanzas ---
  /** Presupuesto total estimado (debe coincidir con la suma de materials + breakdown) */
  estimatedBudget: number;
  budgetBreakdown?: BudgetLine[];

  // --- Documentación ---
  attachments?: Attachment[];
  notes?: string;

  // --- Ciclo de Aprobación ---
  approval?: {
    by: string;
    at: Date;
    comments?: string;
  };

  rejection?: {
    by: string;
    at: Date;
    reason: string;
  };

  // --- Auditoría ---
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}


