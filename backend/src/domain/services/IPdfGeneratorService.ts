// --- DTOs para generación de documentos ---

export interface ActivityReportData {
  order: {
    orderNumber: string;
    clientName: string;
    location: string;
    description: string;
    createdAt: Date;
  };
  execution: {
    startDate: Date;
    endDate: Date;
    durationHours: number;
  };
  technician: {
    name: string;
    role: string;
    email: string;
  };
  evidences: Array<{
    description: string;
    type: string;
    filePath: string;
    capturedAt: Date;
  }>;
  observations?: string;
  generatedAt: Date;
}

export interface ActaEntregaData {
  orderNumber: string;
  clientName: string;
  location: string;
  description: string;
  deliveryDate: Date;
  client: {
    name: string;
    representative: string;
    idNumber: string;
  };
  technician: {
    name: string;
    role: string;
    idNumber: string;
  };
  deliveredItems: Array<{
    description: string;
    quantity: number;
    condition: string;
  }>;
  observations?: string;
  signatures: {
    client: boolean;
    technician: boolean;
  };
}

export interface SESData {
  orderNumber: string;
  clientName: string;
  location: string;
  description: string;
  date: Date;
  workPlan: {
    plannedStart: Date;
    plannedEnd: Date;
    tasks: Array<{ description: string; completed: boolean }>;
  };
  technician: {
    name: string;
    role: string;
    certifications: string[];
  };
  safetyChecklist: Array<{
    item: string;
    verified: boolean;
    observations?: string;
  }>;
  equipmentCertifications: Array<{
    name: string;
    certNumber: string;
    expiryDate: Date;
  }>;
  riskAnalysis: Array<{
    hazard: string;
    risk: string;
    controls: string;
  }>;
}

export interface CostComparisonReportData {
  workPlan: {
    id: string;
    orderId: string;
    estimatedBudget: number;
    materials: Array<{ name: string; quantity: number; unitCost: number }>;
  };
  realCost: number;
  variance: number;
  variancePercentage: number;
  status: string;
  observations?: string;
  generatedAt: Date;
}

export interface DashboardReportData {
  stats: {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    byState: Record<string, number>;
    byMonth: Array<{ month: string; count: number }>;
  };
  period: {
    start: Date;
    end: Date;
  };
  generatedAt: Date;
}

export interface WorkPlanPDFData {
  workPlan: {
    id: string;
    orderId: string;
    status: string;
    materials: Array<{ name: string; quantity: number; unitCost: number }>;
    tools: Array<{ name: string; quantity: number }>;
    equipment: Array<{ name: string; certification?: string }>;
    ppe: Array<{ name: string; quantity: number }>;
    tasks: Array<{ description: string; owner: string; scheduledDate: Date }>;
    estimatedBudget: number;
    plannedWindow?: { start: Date; end: Date };
    notes?: string;
  };
  order: {
    orderNumber: string;
    clientName: string;
    location?: string;
    description: string;
  };
  generatedAt: Date;
}

/**
 * Servicio de Generación de Documentos
 * Convierte datos estructurados en documentos portables (PDF).
 */
export interface IPdfGeneratorService {
  generateActivityReport(data: ActivityReportData): Promise<Buffer>;
  generateActaEntrega(data: ActaEntregaData): Promise<Buffer>;
  generateSES(data: SESData): Promise<Buffer>;
  generateCostComparisonReport(data: CostComparisonReportData): Promise<Buffer>;
  generateDashboardReport(data: DashboardReportData): Promise<Buffer>;
  generateWorkPlanPDF(data: WorkPlanPDFData): Promise<Buffer>;
}

