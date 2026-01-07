import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { buildHttpParams } from '../core/utils/http-params.util';
import { createHttpErrorHandler } from '../core/utils/http-error.util';
import { Orden, CreateOrdenDto, UpdateOrdenDto, ListOrdenesQuery, PaginatedOrdenes } from '../core/models/orden.model';

@Injectable({
    providedIn: 'root'
})
export class OrdenesService {
    private readonly http = inject(HttpClient);
    private readonly API_URL = `${environment.apiUrl}/ordenes`;
    private readonly handleError = createHttpErrorHandler('OrdenesService');

    /**
     * Obtiene todas las órdenes con paginación y filtros
     */
    getAll(params?: ListOrdenesQuery): Observable<PaginatedOrdenes> {
        return this.http.get<PaginatedOrdenes>(this.API_URL, { params: buildHttpParams(params as unknown as Record<string, unknown> | undefined) }).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Obtiene una orden por su ID
     */
    getById(id: string): Observable<Orden> {
        return this.http.get<Orden>(`${this.API_URL}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Crea una nueva orden
     */
    create(orden: CreateOrdenDto): Observable<Orden> {
        return this.http.post<Orden>(this.API_URL, orden).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Actualiza una orden existente
     */
    update(id: string, orden: UpdateOrdenDto): Observable<Orden> {
        return this.http.patch<Orden>(`${this.API_URL}/${id}`, orden).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Elimina una orden (soft delete)
     */
    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Obtiene estadísticas de órdenes
     */
    getEstadisticas(): Observable<Record<string, unknown>> {
        return this.http.get<Record<string, unknown>>(`${this.API_URL}/stats`).pipe(
            catchError(this.handleError)
        );
    }

    /**
     * Exporta órdenes a PDF
     */
    exportarPDF(params?: ListOrdenesQuery): Observable<Blob> {
        return this.http.get(`${this.API_URL}/export/pdf`, {
            params: buildHttpParams(params as unknown as Record<string, unknown> | undefined),
            responseType: 'blob'
        }).pipe(
            catchError(this.handleError)
        );
    }
}
