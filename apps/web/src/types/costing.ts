// Costing types

export interface Costing {
  id: string;
  ordenId: string;
  workPlanId?: string;
  estado: CostingStatus;
  items: CostingItem[];
  subtotal: number;
  impuestos: number;
  total: number;
  aprobadoPor?: string;
  aprobadoAt?: string;
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

export type CostingStatus = 'borrador' | 'pendiente_aprobacion' | 'aprobado' | 'rechazado';

export interface CostingItem {
  id: string;
  concepto: string;
  descripcion?: string;
  categoria: CostingCategory;
  cantidad: number;
  unidad: string;
  valorUnitario: number;
  valorTotal: number;
  esEstimado: boolean;
}

export type CostingCategory = 
  | 'material'
  | 'mano_obra'
  | 'transporte'
  | 'equipo'
  | 'herramientas'
  | 'subcontrato'
  | 'otros';

export interface CostingCreate {
  ordenId: string;
  workPlanId?: string;
  items: CostingItemCreate[];
  notas?: string;
}

export interface CostingItemCreate {
  concepto: string;
  descripcion?: string;
  categoria: CostingCategory;
  cantidad: number;
  unidad: string;
  valorUnitario: number;
  esEstimado?: boolean;
}

export interface CostingAnalysis {
  ordenId: string;
  presupuestado: number;
  ejecutado: number;
  diferencia: number;
  porcentajeEjecutado: number;
  detallesPorCategoria: {
    categoria: CostingCategory;
    presupuestado: number;
    ejecutado: number;
    diferencia: number;
  }[];
}
