/**
 * CostosApi - Costs API Client
 * 
 * Extends ApiBaseService for consistent HTTP handling.
 * Manages cost tracking and analysis per order.
 * 
 * @see apps/api/src/modules/costos/infrastructure/controllers/costos.controller.ts
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';

// ============================================
// DTOs aligned with backend
// ============================================

export interface Costo {
    id: string;
    ordenId: string;
    tipo: 'material' | 'mano_obra' | 'transporte' | 'otro';
    descripcion: string;
    monto: number;
    cantidad: number;
    unidad: string;
    fecha: string;
    creadoPorId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CostoQuery {
    ordenId?: string;
    tipo?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    page?: number;
    limit?: number;
}

export interface RegistrarCostoDto {
    ordenId: string;
    tipo: 'material' | 'mano_obra' | 'transporte' | 'otro';
    descripcion: string;
    monto: number;
    cantidad: number;
    unidad: string;
}

export interface AnalisisCostos {
    ordenId: string;
    totalMateriales: number;
    totalManoObra: number;
    totalTransporte: number;
    totalOtros: number;
    granTotal: number;
    costos: Costo[];
}

export interface PaginatedCostos {
    data: Costo[];
    total: number;
    page: number;
    limit: number;
}

// ============================================
// CostosApi Service
// ============================================

@Injectable({
    providedIn: 'root'
})
export class CostosApi extends ApiBaseService {
    private readonly basePath = '/costos';

    /**
     * GET /costos - List all costs with filters
     */
    list(query?: CostoQuery): Observable<PaginatedCostos> {
        return this.get<PaginatedCostos>(this.basePath, query as Record<string, unknown>);
    }

    /**
     * GET /costos/analisis/:ordenId - Get cost analysis for an order
     */
    getAnalisis(ordenId: string): Observable<AnalisisCostos> {
        return this.get<AnalisisCostos>(`${this.basePath}/analisis/${ordenId}`);
    }

    /**
     * POST /costos - Register a new cost
     */
    registrar(dto: RegistrarCostoDto): Observable<Costo> {
        return this.post<Costo>(this.basePath, dto);
    }
}
