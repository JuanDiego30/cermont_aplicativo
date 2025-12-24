/**
 * Costing Model - Angular Frontend
 * Tipos para costeo y presupuestos de órdenes
 * Migrado de web-old/src/types/costing.ts
 */

export type CostingStatus = 'borrador' | 'pendiente_aprobacion' | 'aprobado' | 'rechazado';

export type CostingCategory =
    | 'material'
    | 'mano_obra'
    | 'transporte'
    | 'equipo'
    | 'herramientas'
    | 'subcontrato'
    | 'otros';

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

export interface CreateCostingDto {
    ordenId: string;
    workPlanId?: string;
    items: CreateCostingItemDto[];
    notas?: string;
}

export interface CreateCostingItemDto {
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
