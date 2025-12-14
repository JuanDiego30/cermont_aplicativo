/**
 * @file costos.types.ts
 * @description Type definitions for Costos module
 */

export interface Costo {
    id: string;
    ordenId: string;
    concepto: string;
    monto: number;
    tipo: 'material' | 'mano_obra' | 'transporte' | 'otros';
    estado: 'pendiente' | 'aprobado' | 'rechazado';
    createdAt: string;
}

export interface CostoFilters {
    ordenId?: string;
    tipo?: string;
    estado?: string;
    fechaInicio?: string;
    fechaFin?: string;
}

export interface CreateCostoInput {
    ordenId: string;
    concepto: string;
    monto: number;
    tipo: 'material' | 'mano_obra' | 'transporte' | 'otros';
}

export interface ResumenPeriodo {
    totalCostos: number;
    costosMaterial: number;
    costosManoObra: number;
    costosTransporte: number;
    costosOtros: number;
    periodo: string;
    totalPresupuestado: number;
    totalReal: number;
    varianzaTotal: number;
    totalOrdenes: number;
}
