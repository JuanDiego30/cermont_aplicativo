/**
 * EjecucionApi - Execution API Client
 * 
 * Extends ApiBaseService for consistent HTTP handling.
 * Manages order execution workflow: start, progress updates, completion.
 * 
 * @see apps/api/src/modules/ejecucion/infrastructure/controllers/ejecucion.controller.ts
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from './api-base.service';

// ============================================
// DTOs aligned with backend
// ============================================

export type EstadoEjecucion = 'no_iniciada' | 'en_progreso' | 'pausada' | 'completada' | 'cancelada';

export interface Ejecucion {
    id: string;
    ordenId: string;
    tecnicoId: string;
    estado: EstadoEjecucion;
    avance: number;
    observaciones?: string;
    iniciadaEn?: string;
    finalizadaEn?: string;
    iniciadaPorId?: string;
    finalizadaPorId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface IniciarEjecucionDto {
    tecnicoId: string;
    observaciones?: string;
}

export interface UpdateAvanceDto {
    avance: number;
    observaciones?: string;
}

export interface CompletarEjecucionDto {
    observaciones?: string;
    resultados?: string;
}

// ============================================
// EjecucionApi Service
// ============================================

@Injectable({
    providedIn: 'root'
})
export class EjecucionApi extends ApiBaseService {
    private readonly basePath = '/ejecucion';

    /**
     * GET /ejecucion/orden/:ordenId - Get execution for an order
     */
    getByOrden(ordenId: string): Observable<Ejecucion> {
        return this.get<Ejecucion>(`${this.basePath}/orden/${ordenId}`);
    }

    /**
     * GET /ejecucion/mis-ejecuciones - Get current technician's executions
     */
    getMisEjecuciones(): Observable<Ejecucion[]> {
        return this.get<Ejecucion[]>(`${this.basePath}/mis-ejecuciones`);
    }

    /**
     * POST /ejecucion/orden/:ordenId/iniciar - Start order execution
     */
    iniciar(ordenId: string, dto: IniciarEjecucionDto): Observable<Ejecucion> {
        return this.post<Ejecucion>(`${this.basePath}/orden/${ordenId}/iniciar`, dto);
    }

    /**
     * PUT /ejecucion/:id/avance - Update execution progress
     */
    updateAvance(id: string, dto: UpdateAvanceDto): Observable<Ejecucion> {
        return this.put<Ejecucion>(`${this.basePath}/${id}/avance`, dto);
    }

    /**
     * PUT /ejecucion/:id/completar - Complete execution
     */
    completar(id: string, dto: CompletarEjecucionDto): Observable<Ejecucion> {
        return this.put<Ejecucion>(`${this.basePath}/${id}/completar`, dto);
    }
}
