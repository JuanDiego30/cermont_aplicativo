import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { OrdenesApi, PaginatedOrdenes, OrdenesStats } from '../../../core/api/ordenes.api';
import {
    Orden,
    CreateOrdenDto,
    UpdateOrdenDto,
    ChangeEstadoOrdenDto,
    AsignarTecnicoOrdenDto,
    ListOrdenesQuery,
    HistorialEstado
} from '../../../core/models/orden.model';

// Re-export types for components
export type { PaginatedOrdenes, OrdenesStats };

@Injectable({
    providedIn: 'root'
})
export class OrdenesService {
    private readonly ordenesApi = inject(OrdenesApi);

    /**
     * Lista todas las órdenes con filtros opcionales
     */
    list(params?: ListOrdenesQuery): Observable<PaginatedOrdenes> {
        return this.ordenesApi.list(params);
    }

    /**
     * Obtiene una orden por ID
     */
    getById(id: string): Observable<Orden> {
        return this.ordenesApi.getById(id);
    }

    /**
     * Crea una nueva orden
     */
    create(data: CreateOrdenDto): Observable<Orden> {
        return this.ordenesApi.create(data);
    }

    /**
     * Actualiza una orden existente
     */
    update(id: string, data: UpdateOrdenDto): Observable<Orden> {
        return this.ordenesApi.update(id, data);
    }

    /**
     * Elimina una orden
     */
    delete(id: string): Observable<void> {
        return this.ordenesApi.delete(id);
    }

    /**
     * Cambia el estado de una orden
     */
    changeEstado(id: string, dto: ChangeEstadoOrdenDto): Observable<Orden> {
        return this.ordenesApi.changeEstado(id, dto);
    }

    /**
     * Asigna un técnico a una orden
     */
    asignarTecnico(ordenId: string, dto: AsignarTecnicoOrdenDto): Observable<Orden> {
        return this.ordenesApi.asignarTecnico(ordenId, dto);
    }

    /**
     * Obtiene el historial de cambios de estado de una orden
     */
    getHistorial(id: string): Observable<HistorialEstado[]> {
        return this.ordenesApi.getHistorial(id);
    }

    /**
     * Obtiene estadísticas de órdenes
     */
    getStats(): Observable<OrdenesStats> {
        return this.ordenesApi.getStats();
    }
}
