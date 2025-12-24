import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import {
    Orden,
    CreateOrdenDto,
    UpdateOrdenDto,
    ListOrdenesQuery,
    OrderEstado
} from '../../../core/models/orden.model';

export interface PaginatedOrdenes {
    data: Orden[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface OrdenesStats {
    total: number;
    planeacion: number;
    ejecucion: number;
    completadas: number;
    canceladas: number;
}

@Injectable({
    providedIn: 'root'
})
export class OrdenesService {
    private readonly api = inject(ApiService);

    /**
     * Lista todas las órdenes con filtros opcionales
     */
    list(params?: ListOrdenesQuery): Observable<PaginatedOrdenes> {
        let httpParams = new HttpParams();

        if (params) {
            if (params.page) httpParams = httpParams.set('page', params.page.toString());
            if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
            if (params.search) httpParams = httpParams.set('search', params.search);
            if (params.estado) httpParams = httpParams.set('estado', params.estado);
            if (params.prioridad) httpParams = httpParams.set('prioridad', params.prioridad);
            if (params.asignadoId) httpParams = httpParams.set('asignadoId', params.asignadoId);
        }

        return this.api.get<PaginatedOrdenes>('/ordenes', httpParams);
    }

    /**
     * Obtiene una orden por ID
     */
    getById(id: string): Observable<Orden> {
        return this.api.get<Orden>(`/ordenes/${id}`);
    }

    /**
     * Crea una nueva orden
     */
    create(data: CreateOrdenDto): Observable<Orden> {
        return this.api.post<Orden>('/ordenes', data);
    }

    /**
     * Actualiza una orden existente
     */
    update(id: string, data: UpdateOrdenDto): Observable<Orden> {
        return this.api.patch<Orden>(`/ordenes/${id}`, data);
    }

    /**
     * Elimina una orden
     */
    delete(id: string): Observable<void> {
        return this.api.delete<void>(`/ordenes/${id}`);
    }

    /**
     * Cambia el estado de una orden
     */
    changeEstado(id: string, estado: OrderEstado): Observable<Orden> {
        return this.api.patch<Orden>(`/ordenes/${id}/estado`, { estado });
    }

    /**
     * Asigna un técnico a una orden
     */
    asignarTecnico(ordenId: string, tecnicoId: string): Observable<Orden> {
        return this.api.patch<Orden>(`/ordenes/${ordenId}/asignar`, { tecnicoId });
    }

    /**
     * Obtiene estadísticas de órdenes
     */
    getStats(): Observable<OrdenesStats> {
        return this.api.get<OrdenesStats>('/ordenes/stats');
    }
}
